"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/swap-request";
exports.ids = ["pages/api/swap-request"];
exports.modules = {

/***/ "@sendgrid/mail":
/*!*********************************!*\
  !*** external "@sendgrid/mail" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@sendgrid/mail");

/***/ }),

/***/ "next-auth/jwt":
/*!********************************!*\
  !*** external "next-auth/jwt" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("next-auth/jwt");

/***/ }),

/***/ "next/dist/compiled/next-server/pages-api.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages-api.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages-api.runtime.dev.js");

/***/ }),

/***/ "(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fswap-request&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fswap-request.ts&middlewareConfigBase64=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fswap-request&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fswap-request.ts&middlewareConfigBase64=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   routeModule: () => (/* binding */ routeModule)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/pages-api/module.compiled */ \"(api)/./node_modules/next/dist/server/future/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(api)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api)/./node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _pages_api_swap_request_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/api/swap-request.ts */ \"(api)/./pages/api/swap-request.ts\");\n\n\n\n// Import the userland code.\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_swap_request_ts__WEBPACK_IMPORTED_MODULE_3__, \"default\"));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_pages_api_swap_request_ts__WEBPACK_IMPORTED_MODULE_3__, \"config\");\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/swap-request\",\n        pathname: \"/api/swap-request\",\n        // The following aren't used in production.\n        bundlePath: \"\",\n        filename: \"\"\n    },\n    userland: _pages_api_swap_request_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n\n//# sourceMappingURL=pages-api.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LXJvdXRlLWxvYWRlci9pbmRleC5qcz9raW5kPVBBR0VTX0FQSSZwYWdlPSUyRmFwaSUyRnN3YXAtcmVxdWVzdCZwcmVmZXJyZWRSZWdpb249JmFic29sdXRlUGFnZVBhdGg9LiUyRnBhZ2VzJTJGYXBpJTJGc3dhcC1yZXF1ZXN0LnRzJm1pZGRsZXdhcmVDb25maWdCYXNlNjQ9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNMO0FBQzFEO0FBQ3dEO0FBQ3hEO0FBQ0EsaUVBQWUsd0VBQUssQ0FBQyx1REFBUSxZQUFZLEVBQUM7QUFDMUM7QUFDTyxlQUFlLHdFQUFLLENBQUMsdURBQVE7QUFDcEM7QUFDTyx3QkFBd0IsZ0hBQW1CO0FBQ2xEO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLFlBQVk7QUFDWixDQUFDOztBQUVEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmluLWJ1ZGR5Lz82NGZiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBhZ2VzQVBJUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9wYWdlcy1hcGkvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgaG9pc3QgfSBmcm9tIFwibmV4dC9kaXN0L2J1aWxkL3RlbXBsYXRlcy9oZWxwZXJzXCI7XG4vLyBJbXBvcnQgdGhlIHVzZXJsYW5kIGNvZGUuXG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiLi9wYWdlcy9hcGkvc3dhcC1yZXF1ZXN0LnRzXCI7XG4vLyBSZS1leHBvcnQgdGhlIGhhbmRsZXIgKHNob3VsZCBiZSB0aGUgZGVmYXVsdCBleHBvcnQpLlxuZXhwb3J0IGRlZmF1bHQgaG9pc3QodXNlcmxhbmQsIFwiZGVmYXVsdFwiKTtcbi8vIFJlLWV4cG9ydCBjb25maWcuXG5leHBvcnQgY29uc3QgY29uZmlnID0gaG9pc3QodXNlcmxhbmQsIFwiY29uZmlnXCIpO1xuLy8gQ3JlYXRlIGFuZCBleHBvcnQgdGhlIHJvdXRlIG1vZHVsZSB0aGF0IHdpbGwgYmUgY29uc3VtZWQuXG5leHBvcnQgY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgUGFnZXNBUElSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuUEFHRVNfQVBJLFxuICAgICAgICBwYWdlOiBcIi9hcGkvc3dhcC1yZXF1ZXN0XCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvc3dhcC1yZXF1ZXN0XCIsXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgYXJlbid0IHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgICAgYnVuZGxlUGF0aDogXCJcIixcbiAgICAgICAgZmlsZW5hbWU6IFwiXCJcbiAgICB9LFxuICAgIHVzZXJsYW5kXG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFnZXMtYXBpLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fswap-request&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fswap-request.ts&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api)/./pages/api/swap-request.ts":
/*!***********************************!*\
  !*** ./pages/api/swap-request.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth_jwt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/jwt */ \"next-auth/jwt\");\n/* harmony import */ var next_auth_jwt__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth_jwt__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _utils_emailUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/emailUtils */ \"(api)/./utils/emailUtils.ts\");\n\n\nasync function handler(req, res) {\n    const token = await (0,next_auth_jwt__WEBPACK_IMPORTED_MODULE_0__.getToken)({\n        req\n    });\n    if (!token) return res.status(401).end(\"Unauthorized\");\n    const { targetEmail, requester, week } = req.body;\n    try {\n        await (0,_utils_emailUtils__WEBPACK_IMPORTED_MODULE_1__.sendSwapEmail)(targetEmail, requester, week);\n        res.status(200).json({\n            success: true\n        });\n    } catch (e) {\n        res.status(500).json({\n            error: \"Failed to send swap request.\"\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvc3dhcC1yZXF1ZXN0LnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDd0M7QUFDYztBQUV2QyxlQUFlRSxRQUM1QkMsR0FBbUIsRUFDbkJDLEdBQW9CO0lBRXBCLE1BQU1DLFFBQVEsTUFBTUwsdURBQVFBLENBQUM7UUFBRUc7SUFBSTtJQUNuQyxJQUFJLENBQUNFLE9BQU8sT0FBT0QsSUFBSUUsTUFBTSxDQUFDLEtBQUtDLEdBQUcsQ0FBQztJQUV2QyxNQUFNLEVBQUVDLFdBQVcsRUFBRUMsU0FBUyxFQUFFQyxJQUFJLEVBQUUsR0FBR1AsSUFBSVEsSUFBSTtJQUVqRCxJQUFJO1FBQ0YsTUFBTVYsZ0VBQWFBLENBQUNPLGFBQWFDLFdBQVdDO1FBQzVDTixJQUFJRSxNQUFNLENBQUMsS0FBS00sSUFBSSxDQUFDO1lBQUVDLFNBQVM7UUFBSztJQUN2QyxFQUFFLE9BQU9DLEdBQUc7UUFDVlYsSUFBSUUsTUFBTSxDQUFDLEtBQUtNLElBQUksQ0FBQztZQUFFRyxPQUFPO1FBQStCO0lBQy9EO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9iaW4tYnVkZHkvLi9wYWdlcy9hcGkvc3dhcC1yZXF1ZXN0LnRzPzI4MWMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBOZXh0QXBpUmVxdWVzdCwgTmV4dEFwaVJlc3BvbnNlIH0gZnJvbSAnbmV4dCdcbmltcG9ydCB7IGdldFRva2VuIH0gZnJvbSAnbmV4dC1hdXRoL2p3dCdcbmltcG9ydCB7IHNlbmRTd2FwRW1haWwgfSBmcm9tICcuLi8uLi91dGlscy9lbWFpbFV0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKFxuICByZXE6IE5leHRBcGlSZXF1ZXN0LFxuICByZXM6IE5leHRBcGlSZXNwb25zZVxuKSB7XG4gIGNvbnN0IHRva2VuID0gYXdhaXQgZ2V0VG9rZW4oeyByZXEgfSlcbiAgaWYgKCF0b2tlbikgcmV0dXJuIHJlcy5zdGF0dXMoNDAxKS5lbmQoJ1VuYXV0aG9yaXplZCcpXG5cbiAgY29uc3QgeyB0YXJnZXRFbWFpbCwgcmVxdWVzdGVyLCB3ZWVrIH0gPSByZXEuYm9keVxuXG4gIHRyeSB7XG4gICAgYXdhaXQgc2VuZFN3YXBFbWFpbCh0YXJnZXRFbWFpbCwgcmVxdWVzdGVyLCB3ZWVrKVxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3VjY2VzczogdHJ1ZSB9KVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBzZW5kIHN3YXAgcmVxdWVzdC4nIH0pXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJnZXRUb2tlbiIsInNlbmRTd2FwRW1haWwiLCJoYW5kbGVyIiwicmVxIiwicmVzIiwidG9rZW4iLCJzdGF0dXMiLCJlbmQiLCJ0YXJnZXRFbWFpbCIsInJlcXVlc3RlciIsIndlZWsiLCJib2R5IiwianNvbiIsInN1Y2Nlc3MiLCJlIiwiZXJyb3IiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./pages/api/swap-request.ts\n");

/***/ }),

/***/ "(api)/./utils/emailUtils.ts":
/*!*****************************!*\
  !*** ./utils/emailUtils.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   sendSwapEmail: () => (/* binding */ sendSwapEmail)\n/* harmony export */ });\n/* harmony import */ var _sendgrid_mail__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @sendgrid/mail */ \"@sendgrid/mail\");\n/* harmony import */ var _sendgrid_mail__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_sendgrid_mail__WEBPACK_IMPORTED_MODULE_0__);\n\n_sendgrid_mail__WEBPACK_IMPORTED_MODULE_0___default().setApiKey(process.env.SENDGRID_API_KEY);\nasync function sendSwapEmail(to, requester, week) {\n    const approvalUrl = `https://your-app.com/approve?week=${week}&from=${requester}`;\n    await _sendgrid_mail__WEBPACK_IMPORTED_MODULE_0___default().send({\n        to,\n        from: \"binbuddy@example.com\",\n        subject: `Swap Request for Week ${week}`,\n        text: `${requester} wants to swap garbage duty for week ${week}. Approve here: ${approvalUrl}`\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi91dGlscy9lbWFpbFV0aWxzLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFtQztBQUNuQ0EsK0RBQWdCLENBQUNFLFFBQVFDLEdBQUcsQ0FBQ0MsZ0JBQWdCO0FBRXRDLGVBQWVDLGNBQ3BCQyxFQUFVLEVBQ1ZDLFNBQWlCLEVBQ2pCQyxJQUFZO0lBRVosTUFBTUMsY0FBYyxDQUFDLGtDQUFrQyxFQUFFRCxLQUFLLE1BQU0sRUFBRUQsVUFBVSxDQUFDO0lBRWpGLE1BQU1QLDBEQUFXLENBQUM7UUFDaEJNO1FBQ0FLLE1BQU07UUFDTkMsU0FBUyxDQUFDLHNCQUFzQixFQUFFSixLQUFLLENBQUM7UUFDeENLLE1BQU0sQ0FBQyxFQUFFTixVQUFVLHFDQUFxQyxFQUFFQyxLQUFLLGdCQUFnQixFQUFFQyxZQUFZLENBQUM7SUFDaEc7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2Jpbi1idWRkeS8uL3V0aWxzL2VtYWlsVXRpbHMudHM/YzM5MSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc2dNYWlsIGZyb20gJ0BzZW5kZ3JpZC9tYWlsJ1xuc2dNYWlsLnNldEFwaUtleShwcm9jZXNzLmVudi5TRU5ER1JJRF9BUElfS0VZISlcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmRTd2FwRW1haWwoXG4gIHRvOiBzdHJpbmcsXG4gIHJlcXVlc3Rlcjogc3RyaW5nLFxuICB3ZWVrOiBzdHJpbmdcbikge1xuICBjb25zdCBhcHByb3ZhbFVybCA9IGBodHRwczovL3lvdXItYXBwLmNvbS9hcHByb3ZlP3dlZWs9JHt3ZWVrfSZmcm9tPSR7cmVxdWVzdGVyfWBcblxuICBhd2FpdCBzZ01haWwuc2VuZCh7XG4gICAgdG8sXG4gICAgZnJvbTogJ2JpbmJ1ZGR5QGV4YW1wbGUuY29tJyxcbiAgICBzdWJqZWN0OiBgU3dhcCBSZXF1ZXN0IGZvciBXZWVrICR7d2Vla31gLFxuICAgIHRleHQ6IGAke3JlcXVlc3Rlcn0gd2FudHMgdG8gc3dhcCBnYXJiYWdlIGR1dHkgZm9yIHdlZWsgJHt3ZWVrfS4gQXBwcm92ZSBoZXJlOiAke2FwcHJvdmFsVXJsfWAsXG4gIH0pXG59XG4iXSwibmFtZXMiOlsic2dNYWlsIiwic2V0QXBpS2V5IiwicHJvY2VzcyIsImVudiIsIlNFTkRHUklEX0FQSV9LRVkiLCJzZW5kU3dhcEVtYWlsIiwidG8iLCJyZXF1ZXN0ZXIiLCJ3ZWVrIiwiYXBwcm92YWxVcmwiLCJzZW5kIiwiZnJvbSIsInN1YmplY3QiLCJ0ZXh0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./utils/emailUtils.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(api)/./node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fswap-request&preferredRegion=&absolutePagePath=.%2Fpages%2Fapi%2Fswap-request.ts&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();