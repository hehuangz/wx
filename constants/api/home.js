const api = {
    HOME_NEARLY_SHOP: 'shop/getNearlyShop',
    HOME_SAOMA: 'shop/getNearlyShop',
    HOME_ADVISER: 'users/searchAssistantByShopId',
    HOME_CATEGORY_FIRST: 'goods/getFirstCategoryByShopId', // 根据店铺id获取一级分类
    HOME_COODS:'goods/getGoodsByShopAndFirstId',
    HOME_SHOP_ADDRESS:'shop/view'
};
export default api;