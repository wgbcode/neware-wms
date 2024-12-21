#!/bin/bash
# 暂时只支持单个用户使用，多用户支持功能待完善
user_IP="wuguangbin@120.79.154.128" # 用户名和服务器 IP
key_name="vue3_deploy_server_id" # SSH 密钥文件名
dir_name="Vue3Web" # 前端静态文件名
deploy_path="D:\IIS" # 前端静态文件路径
site_name="vue3.neware.work" # 网站域名
deploy_dir="${deploy_path}\\${dir_name}"
ssh_dir="$HOME/.ssh"
key_file="$ssh_dir/$key_name"
sshId="~/.ssh/$key_name"

# 参数解析
skip_build=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-build)  
            skip_build=true 
            ;;
    esac
    shift 
done

# 错误处理函数
error_exit() {
  echo -e "\e[41mError: $1\e[0m"  
  exit 1
}

# 按 ctrl+c 处理函数
interrupt_handler() {
  echo -e "\n\e[93mWarning: 已退出部署\e[0m"  
  exit 2
}
trap interrupt_handler SIGINT

# 检查 ~/.ssh 目录是否存在，不存在则创建
if [ ! -d "$ssh_dir" ]; then
    mkdir -p "$ssh_dir"
    echo "Created directory: $ssh_dir"
fi

# 检查密钥是否存在
if [ -f "$key_file" ]; then
    # 密钥存在时，直接部署项目
    if [ "$skip_build" = false ]; then
        # 运行 yarn deploy-sb 命令，会跳过拉取代码和打包阶段
        echo -e "\e[34mBegin: 开始拉取远程仓库代码...\e[0m"
        git pull origin master --rebase || error_exit "代码拉取失败"
        echo -e "\e[34mBegin: 开始打包项目...\e[0m"
        yarn build || error_exit "打包失败"
    fi
    echo -e "\e[34mBegin: 开始部署项目...\e[0m"
    tar -czf dist.gz dist
    scp -i "$sshId" ./dist.gz "$user_IP":.  || error_exit "复制打包文件到服务器失败"
    rm dist.gz
    ssh -i "$sshId" "$user_IP" " \
        xcopy /E /I /H $deploy_dir $dir_name  && \
        rmdir /s /q $deploy_dir && \
        mkdir $deploy_dir && \
        move $dir_name\web.config $deploy_dir && \
        tar -xzf dist.gz --strip-components=1 -C $deploy_dir && \
        del dist.gz \
        " || {
            ssh -i "$sshId" "$user_IP" " \
                mkdir $deploy_dir && \
                xcopy /E /I /H $dir_name $deploy_dir && \
                rmdir /s /q $dir_name && \
                del dist.gz \
            "
            if [ "$skip_build" = false ]; then
                echo -e "\e[34mBegin: 首次部署失败，正在尝试重新部署...\e[0m"
                yarn deploy-sb && exit 0 || error_exit "重新部署失败"
            else
                error_exit "部署失败"
            fi
        }
    # 删除备份文件，重启 IIS 服务
    ssh -i "$sshId" "$user_IP" " \
        rmdir /s /q $dir_name && \
        %windir%\system32\inetsrv\appcmd stop site /site.name:"$site_name" && \
        %windir%\system32\inetsrv\appcmd start site /site.name:"$site_name" \
    "
    echo -e "\e[102mSuccess: 项目已成功部署\e[0m"
else
    # 密钥不存在时，先配置密钥
    echo -e "\e[34mBegin: 开始配置 SSH 密钥...\e[0m"
    ssh-keygen -t rsa -b 4096  -f "$key_file" -N ""
    echo -e "\e[34mLogin: 请输入服务器密码\e[0m"
    scp ~/.ssh/$key_name.pub "$user_IP":~/.ssh || {
        rm "$ssh_dir/$key_name"
        rm "$ssh_dir/$key_name.pub"
        error_exit "复制公钥到服务器失败"
    }
    echo -e "\e[34mLogin: 请再次输入服务器密码\e[0m"
    ssh "$user_IP" " \
        cd ./.ssh && \
        echo. >> authorized_keys && \
        type $key_name.pub >> authorized_keys && \
        del $key_name.pub \
        " || {
            rm "$ssh_dir/$key_name"
            rm "$ssh_dir/$key_name.pub"
            error_exit "公钥配置失败"
        }
    echo -e "\e[102mSuccess: SSH 密钥已成功配置\e[0m"
    yarn deploy
fi


