import common from './api/common';
import login from './api/login';
import home from './api/home';
const baseUrl = 'https://api.wutonglife.com/life/';
const API = {
	...common,
	...home,
	...login
};

for (let i in API) {
	API[i] = baseUrl + API[i];
}
export default API;
