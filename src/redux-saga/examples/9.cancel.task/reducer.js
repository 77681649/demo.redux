const { combineReducers } = require('../redux')

module.exports = function rootReducer(state,action){
  switch(action.type){
    case 'BACKGROUND_SYNC':
      return state = state.concat(action.data)
    default:
      return state || []
  }
}