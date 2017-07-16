var assert = require('assert')
var weak = require('../')

function UserDefined () {
  this.foo = 'bar'
}

function throwsWeakrefError (funcName, value) {
  try {
    weak[funcName](value);
  } catch (ex) {
    if (ex instanceof TypeError
      && /Weakref instance expected/.test(ex.message)) {
      return true;
    }

    throw ex;
  }
}

describe('reference lifecycles', function () {

  afterEach(gc)

  describe('isWeakRef()', function () {

    it('returns false for primitives', function () {
      assert(!weak.isWeakRef(undefined))
      assert(!weak.isWeakRef(null))
      assert(!weak.isWeakRef(false))
      assert(!weak.isWeakRef(0))
      assert(!weak.isWeakRef(''))
    })

    it('returns false for normal objects', function () {
      assert(!weak.isWeakRef({}))
      assert(!weak.isWeakRef(new Date))
      assert(!weak.isWeakRef(new UserDefined))
    })

    it('returns true for weak references before GC', function () {
      assert(weak.isWeakRef(weak({})))
    })

    it('returns true for weak references during GC', function () {
      var wasWeak = false
        , r = weak({}, function () {
          wasWeak = weak.isWeakRef(r)
        })
      gc()
      assert(wasWeak)
    })

    it('returns true for weak references after GC', function () {
      var r = weak({})
      gc()
      assert(weak.isWeakRef(r))
    })

  })

  describe('get()', function () {

    it('throws for primitives', function () {
      assert(throwsWeakrefError('get', undefined))
      assert(throwsWeakrefError('get', null))
      assert(throwsWeakrefError('get', false))
      assert(throwsWeakrefError('get', 0))
      assert(throwsWeakrefError('get', ''))
    })

    it('throws for normal objects', function () {
      assert(throwsWeakrefError('get', {}))
      assert(throwsWeakrefError('get', new Date))
      assert(throwsWeakrefError('get', new UserDefined))
    })

    it('returns the original object for weak references before GC'
    , function () {
      var o = {}
      assert(weak.get(weak(o)) === o)
    })

    it('returns the original object for weak references during GC', function () {
      var wasCorrectType = false
        , r = weak(new UserDefined, function () {
          // Can't perform reference check, as we (of course) have no reference
          // to the original object
          wasCorrectType = weak.get(r) instanceof UserDefined
        })
      gc()
      assert(wasCorrectType)
    })

    it('returns undefined for weak references after GC', function () {
      var r = weak({})
      gc()
      assert(typeof weak.get(r) === 'undefined')
    })

  })

  describe('isNearDeath()', function () {

    it('throws for primitives', function () {
      assert(throwsWeakrefError('isNearDeath', undefined))
      assert(throwsWeakrefError('isNearDeath', null))
      assert(throwsWeakrefError('isNearDeath', false))
      assert(throwsWeakrefError('isNearDeath', 0))
      assert(throwsWeakrefError('isNearDeath', ''))
    })

    it('throws for normal objects', function () {
      assert(throwsWeakrefError('isNearDeath', {}))
      assert(throwsWeakrefError('isNearDeath', new Date))
      assert(throwsWeakrefError('isNearDeath', new UserDefined))
    })

    it('returns false for weak references before GC', function () {
      assert(!weak.isNearDeath(weak({})))
    })

    it('returns true for weak references during GC', function () {
      var wasNearDeath = false
        , r = weak({}, function () {
          wasNearDeath = weak.isNearDeath(r)
        })
      gc()
      assert(wasNearDeath)
    })

    it('returns false for weak references after GC', function () {
      var r = weak({})
      gc()
      assert(!weak.isNearDeath(r))
    })

  })

  describe('isDead()', function () {

    it('throws for primitives', function () {
      assert(throwsWeakrefError('isDead', undefined))
      assert(throwsWeakrefError('isDead', null))
      assert(throwsWeakrefError('isDead', false))
      assert(throwsWeakrefError('isDead', 0))
      assert(throwsWeakrefError('isDead', ''))
    })

    it('throws for normal objects', function () {
      assert(throwsWeakrefError('isDead', {}))
      assert(throwsWeakrefError('isDead', new Date))
      assert(throwsWeakrefError('isDead', new UserDefined))
    })

    it('returns false for weak references before GC', function () {
      assert(!weak.isDead(weak({})))
    })

    it('returns false for weak references during GC', function () {
      var wasDead = false
        , r = weak({}, function () {
          wasDead = weak.isDead(r)
        })
      gc()
      assert(!wasDead)
    })

    it('returns true for weak references after GC', function () {
      var r = weak({})
      gc()
      assert(weak.isDead(r))
    })

  })

})
