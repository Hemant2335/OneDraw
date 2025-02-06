

const getShapes = async () => {
    const response = await fetch("http://localhost:3000/api/getShapes");
    const shapes = await response.json();
    return shapes;
}

export default getShapes;