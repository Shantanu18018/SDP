// We MUST mock these globals BEFORE pdf-parse is imported
global.DOMMatrix = global.DOMMatrix || class { };
global.ImageData = global.ImageData || class { };
global.Path2D = global.Path2D || class { };
