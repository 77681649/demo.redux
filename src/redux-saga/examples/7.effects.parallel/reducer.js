const { combineReducers } = require('../redux')

module.exports = function rootReducer(state,action){
  switch(action.type){
    case 'FETCH_PRODUCT_SUCCESS':
      return state
    default:
      return state || {}
  }
}