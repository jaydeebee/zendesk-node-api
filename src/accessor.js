var Promise = require('promise');

var Accessor = function(config, single, plural){
  var zdrequest = require('./zdrequest.js')(config)
  var selectedMethods = {};
  var methods = {
    list: function(params){
      return new Promise(function(fufill, reject){
        var urlParams = params ? '?' + params : '';
        zdrequest.get('/' + plural + '.json' + urlParams).then(function(data){
          var key = plural === 'search' ? 'results' : plural
          fufill(data[key])
        }).catch(function(err){
          reject(err)
        })
      })
    },

    showMany: function(ids){
      return new Promise(function(fufill, reject){
        zdrequest.get('/' + plural + '/show_many.json?ids='+ids ).then(function(data){
          var key = plural === 'search' ? 'results' : plural
          fufill(data[key])
        }).catch(function(err){
          reject(err)
        })
      })
    },

    show: function(id){
      return new Promise(function(fufill, reject){
        zdrequest.get('/' + plural + '/' + id + '.json').then(function(data){
          fufill(data[single])
        }).catch(function(err){
          reject(err)
        })
      })
    },

    create: function(data){
      var createData = {}
      createData[single] = data
      return new Promise(function(fufill, reject){
        zdrequest.post('/' + plural + '.json', createData).then(function(data){
          fufill(data)
        }).catch(function(err){
          reject(err)
        })
      })
    },
    
    createOrUpdate: function(data){
      var createData = {}
      createData[single] = data
      return new Promise(function(fufill, reject){
        zdrequest.post('/' + plural + '/create_or_update.json', createData).then(function(data){
          fufill(data)
        }).catch(function(err){
          reject(err)
        })
      })
    },

    update: function(id, data){
      var createData = {}
      createData[single] = data;
      return new Promise(function(fufill, reject){
        zdrequest.put('/' + plural + '/' + id + '.json', createData).then(function(data){
          fufill(data)
        }).catch(function(err){
          reject(err)
        })
      })
    },

    delete: function(id){
      return new Promise(function(fufill, reject){
        zdrequest.delete('/' + plural + '/' + id + '.json').then(function(){
          fufill(true)
        }).catch(function(err){
          reject(err)
        })
      })
    }
  }

  switch(single) {
  case 'ticket':
  case 'organization':
    selectedMethods = {
      ...methods,
      forUserId(userId, params=undefined) {
        return new Promise(function(fufill, reject){
          var urlParams = params ? '?' + params : '';
          zdrequest.get('/users/' + userId + '/tickets.json' + urlParams).then(function(data){
            fufill(data[plural])
          }).catch(function(err){
            reject(err)
          })
        })
      }
    };
    break;

  case 'tag':
    selectedMethods.list = methods.list;
    selectedMethods.getTags = function(targetObjectPlural, id){
      return new Promise(function(fufill, reject){
        zdrequest.put('/' + targetObjectPlural + '/' + id + '/' + plural + '.json', createData).then(function(data){
          fufill(data.tags || [])
        }).catch(function(err){
          reject(err)
        })
      })
    }
    selectedMethods.addTags = function(targetObjectPlural, id, data){
      var createData = {}
      createData[plural] = data;
      return new Promise(function(fufill, reject){
        zdrequest.put('/' + targetObjectPlural + '/' + id + '/' + plural + '.json', createData).then(function(data){
          fufill(data)
        }).catch(function(err){
          reject(err)
        })
      })
    }
    selectedMethods.forTicketId = selectedMethods.getTags.bind(selectedMethods.getTags, 'tickets')
    selectedMethods.forOrganizationId = selectedMethods.getTags.bind(selectedMethods.getTags, 'organizations')
    selectedMethods.forUserId = selectedMethods.getTags.bind(selectedMethods.getTags, 'users')
    selectedMethods.addTagsToTicket = selectedMethods.addTags.bind(selectedMethods.addTags, 'tickets')
    selectedMethods.addTagsToOrganization = selectedMethods.addTags.bind(selectedMethods.addTags, 'organizations')
    selectedMethods.addTagsToUser = selectedMethods.addTags.bind(selectedMethods.addTags, 'users')
    break;

  case 'view':
    selectedMethods = {
      ...methods,
      tickets: function(id, params) {
        return new Promise(function(fufill, reject){
          var urlParams = params ? '?' + params : '';
          zdrequest.get('/' + plural + '/' + id + '/tickets.json' + urlParams).then(function(data){
            fufill(data.tickets)
          }).catch(function(err){
            reject(err)
          })
        })
      }
    };
    break;

  default:
    selectedMethods = methods;
    break;
  }

  return selectedMethods;
}

module.exports = Accessor
