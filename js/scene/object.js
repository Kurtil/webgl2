function makeSceneObjectFactory() {
  let objectId = 1n;
  const objects = new Map();

  function getObjectVertexData(object) {
    const vertexData = [];
    object.points.forEach((point, i) => {
      vertexData.push(point);
      if (i % 2 !== 0) {
        // is odd
        vertexData.push(object.zIndex, ...object.color, 255); // opacity 1
      }
    });

    return vertexData;
  }

  return {
    objectsMap: objects,
    getVertexData() {
      const vertexData = Array.from(objects.values()).flatMap(
        getObjectVertexData
      );

      const DATA_PER_ELEMENT = 7;
      const count = vertexData.length / DATA_PER_ELEMENT; // position 3 + color 4

      const buffer = new ArrayBuffer(
        count *
          (3 * Float32Array.BYTES_PER_ELEMENT +
            4 * Uint8ClampedArray.BYTES_PER_ELEMENT)
      );
      const dataView = new DataView(buffer);

      vertexData.forEach((data, i) => {
        const vertexIndex = Math.floor(i / DATA_PER_ELEMENT);
        const vertexOffset =
          vertexIndex *
          (3 * Float32Array.BYTES_PER_ELEMENT +
            4 * Uint8ClampedArray.BYTES_PER_ELEMENT);

        const dataIndex = i - vertexIndex * DATA_PER_ELEMENT;
        if ([0, 1, 2].includes(dataIndex)) {
          const dataOffset = dataIndex * Float32Array.BYTES_PER_ELEMENT;
          dataView.setFloat32(vertexOffset + dataOffset, data, true);
        } else {
          const dataOffset =
            3 * Float32Array.BYTES_PER_ELEMENT +
            (dataIndex - 3) * Uint8ClampedArray.BYTES_PER_ELEMENT;
          dataView.setUint8(vertexOffset + dataOffset, data);
        }
      });

      return {
        dataView,
        count,
      };
    },
    make(objectData) {
      if (!objectData?.points?.length > 0) {
        throw new Error("An object must have points");
      }

      const object = {
        points: objectData.points,
        zIndex: objectData.zIndex ?? 0,
      };

      object.color = new Uint8ClampedArray(objectData?.color || [0, 0, 0]); // black by default

      object.id = objectId++;

      objects.set(object.id, object);

      return object;
    },
  };
}

export default makeSceneObjectFactory;
