// 报价单数据处理
import { shallowRef, ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import type { quotationInvoice } from '../serviceDetailTypes'
export default function (quotationResData: AnyObject) {
  const invoiceInfo = shallowRef<quotationInvoice>({})
  const quotationListOriginal = ref<AnyObject>({}) // 报价单原始数据（相当于备份）
  const quotationMerge = ref<AnyObject>({}) // 合并报价单
  // 工单
  const isWorkOrdersEmpty = !quotationResData.serviceWorkOrders?.length
  const serviceWorkOrders = quotationResData.serviceWorkOrders || []
  quotationMerge.value.serviceWorkOrders = serviceWorkOrders
  // 报价单
  quotationListOriginal.value = cloneDeep(quotationResData.quotation) // 保存原始数据
  // 合并报价单 完成赋值
  const quotationMergeTmp: AnyObject = mergeQuotation(quotationResData.quotation || [])
  quotationMerge.value.quotation = quotationMergeTmp
  //取客服客户信息栏的数据
  const lastQuotation = quotationResData.quotation[quotationResData.quotation?.length - 1]
  invoiceInfo.value = {
    deliveryDate: lastQuotation?.deliveryDate,
    deliveryMethod: lastQuotation?.deliveryMethod,
    invoiceCategory: lastQuotation?.invoiceCategory,
    invoiceCompany: lastQuotation?.invoiceCompany,
    moneyMeans: lastQuotation?.moneyMeans,
    taxRate: lastQuotation?.taxRate,
    serviceWorkOrders: !isWorkOrdersEmpty ? serviceWorkOrders : quotationMergeTmp?.serviceWorkOrders || [],
    isDisabled: lastQuotation?.isDisabled,
    shippingAddress: lastQuotation?.shippingAddress
  }

  return { invoiceInfo, quotationListOriginal, quotationMerge }
}
/**
 * 合并报价单(合并所有序列号)
 * @param {Array} resQuotationList
 * @returns
 */
export const mergeQuotation = function (resQuotationList: AnyObject[]): AnyObject {
  const quotationMerge: AnyObject = cloneDeep(resQuotationList[resQuotationList.length - 1]) // 取最后一个报价单的信息(外壳)
  // 仅多个报价单才合并,只有多个报价单才有多个重复的序列号
  if (resQuotationList.length > 1) {
    let allProductsList: AnyObject[] = []
    for (let i = 0; i < resQuotationList.length; i++) {
      const quoItem: AnyObject = resQuotationList[i]
      if (quoItem.quotationProducts?.length == 0) {
        return {} // 无序列号的跳过
      }
      const oldQuotationTag: boolean = i < resQuotationList.length - 1 // 非最后一个都为旧报价单
      const productsList = quoItem.quotationProducts.map((item: AnyObject) => {
        return {
          ...item,
          isOld: oldQuotationTag,
          quotationMaterials: item.quotationMaterials?.map((row: AnyObject) => {
            // 物料行注入销售订单
            return {
              ...row,
              isProductOld: oldQuotationTag,
              salesOrderId: quoItem.salesOrderId // 该物料有无销售单号(工程报价用)
            }
          })
        }
      })
      productsList.forEach((newProduct: AnyObject) => {
        const sameProduct = allProductsList.find((p) => p.productCode === newProduct.productCode)
        // 序列号相同时，仅保留物料行，其余（外壳）用新数据
        if (sameProduct) {
          const oldAllMaterials = cloneDeep(sameProduct.quotationMaterials) // 仅保留物料行
          const productTemp: AnyObject = cloneDeep(newProduct)
          allProductsList = allProductsList.filter((p) => p.productCode !== newProduct.productCode) // 删除
          productTemp.quotationMaterials.push(...oldAllMaterials)
          allProductsList.push(productTemp)
        } else {
          allProductsList.push(newProduct)
        }
      })
    }
    quotationMerge.quotationProducts = allProductsList
  }
  return quotationMerge
}
