import common from './api/common';
import login from './api/login';
import home from './api/home';
import adviser from './api/adviser';
import pay from './api/pay';

const baseUrl = 'https://api.wutonglife.com/life/';
const API = {
	...common,
	...home,
	...login,
	...adviser,
	...pay
};

for (let i in API) {
	API[i] = baseUrl + API[i];
}
export default API;
