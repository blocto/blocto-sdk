const simulateFetch = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                data: {
                    status: "SUCCESS"
                }
            });
        }, 2000);
    });
};
export default simulateFetch;
