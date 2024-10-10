/**
 * Map entities
 */
export const MapEntities = function() {//TODOv3 class

}
MapEntities.entities = Object.create(null)

MapEntities.registerEntity = function(className, entityClass) {
	this.entities[className] = entityClass;
}

MapEntities.createEntity = function(map, className) {
	const entityClass = this.entities[className];
	if (!entityClass) {
		return null;
	}
	const entity = new entityClass(className);
	entity.map = map;
	return entity;
}
