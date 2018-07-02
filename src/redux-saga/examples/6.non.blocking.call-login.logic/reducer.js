const { combineReducers } = require('../redux')

module.exports = combineReducers({
  isLoginPending: function (state,action) {
    switch (action.type) {
      case 'LOGIN_REQUEST':
        return true
      case 'LOGIN_SUCCESS':
      case 'LOGIN_ERROR':
      case 'LOGOUT':
        return false
      default:
        return state || false
    }
  },
  user: function (state,action) {
    switch (action.type) {
      case 'LOGIN_SUCCESS':
        return action.user
      case 'LOGIN_ERROR':
      case 'LOGOUT':
        return ''
      default:
        return state || ''
    }
  }
})