const store = require('../../utils/store');

afterEach(() => {
  store.clear();
  jest.clearAllMocks();
});

describe('store', () => {
  describe('all', () => {
    it('should get all store items', () => {
      jest.spyOn(Array, 'from');

      store.set('a', 'test');
      store.set('b', { message: 'test' });

      expect(store.all()).toEqual([
        ['a', 'test'],
        ['b', { message: 'test' }],
      ]);
      expect(Array.from).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a store item', () => {
      jest.spyOn(Map.prototype, 'get');

      store.set('a', 'test');
      store.set('b', { message: 'test' });

      expect(store.get('a')).toEqual('test');
      expect(store.get('b')).toEqual({ message: 'test' });
      expect(store.get('x')).toBeUndefined();
      expect(Map.prototype.get).toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should set a store item', () => {
      jest.spyOn(Map.prototype, 'set');

      expect(store.set('a', 'test')).toBe('test');
      expect(store.set('b', { message: 'test' })).toEqual({ message: 'test' });
      expect(store.set('b', { message: 'abc' })).toEqual({ message: 'abc' });
      expect(Map.prototype.set).toHaveBeenCalled();
    });
  });

  describe('has', () => {
    it('should check item is exists', () => {
      jest.spyOn(Map.prototype, 'has');

      store.set('a', 'test');
      store.set('b', { message: 'test' });

      expect(store.has('a')).toBeTruthy();
      expect(store.has('b')).toBeTruthy();
      expect(store.has('x')).toBeFalsy();
      expect(Map.prototype.has).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a item', () => {
      jest.spyOn(Map.prototype, 'delete');

      store.set('a', 'test');
      store.set('b', { message: 'test' });

      expect(store.delete('a')).toBeTruthy();
      expect(store.delete('b')).toBeTruthy();
      expect(store.delete('x')).toBeFalsy();
      expect(Map.prototype.delete).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should delete all items', () => {
      jest.spyOn(Map.prototype, 'clear');

      store.set('a', 'test');
      store.set('b', { message: 'test' });

      expect(store.clear()).toBeUndefined();
      expect(store.all()).toEqual([]);
      expect(store.get('a')).toBeFalsy();
      expect(Map.prototype.clear).toHaveBeenCalled();
    });
  });
});
