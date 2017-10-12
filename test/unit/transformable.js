import transformable from '../../src/transformable';

describe('transformable', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(transformable, 'greet');
      transformable.greet();
    });

    it('should have been run once', () => {
      expect(transformable.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(transformable.greet).to.have.always.returned('hello');
    });
  });
});
