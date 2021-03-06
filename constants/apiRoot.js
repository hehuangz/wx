import common from './api/common';
import login from './api/login';
import home from './api/home';
import adviser from './api/adviser';
import pay from './api/pay';
import category from './api/category';
import search from './api/search';
import mine from './api/mine';
import goodsDetail from './api/goodsDetail';
import cart from './api/cart';
import buy from './api/buy';
import order from './api/order';

const baseUrl = 'https://api.wutonglife.com/life/';
const API = {
	...common,
	...home,
	...login,
	...adviser,
	...pay,
	...category,
	...search,
	...mine,
	...goodsDetail,
	...cart,
	...buy,
	...order
};

for (let i in API) {
	API[i] = baseUrl + API[i];
}
export default API;
