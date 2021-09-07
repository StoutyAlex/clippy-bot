
const handler = async () => {
    return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({
            hello: 'world',
            method: 'DELETE',
        })
    }
}

export { handler };
