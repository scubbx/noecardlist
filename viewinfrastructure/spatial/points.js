function (doc) {
    if (doc.coordinates && doc.coordinates.length > 0) {
        emit({"type": "Point","coordinates":doc.coordinates})
        //emit(doc.coordinates);
    }
}
