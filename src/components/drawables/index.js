import Drawables from './Drawables';
import ShapeComponents from './shapes';
import StrokeComponents from './strokes';
import GeneralComponents from './general';

Drawables.setComponents('shapes', ShapeComponents);
Drawables.setComponents('strokes', StrokeComponents);
Drawables.setComponents('general', GeneralComponents);

export { Drawables };
