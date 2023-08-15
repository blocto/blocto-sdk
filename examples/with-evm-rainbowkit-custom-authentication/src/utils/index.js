export const simulateFetch = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          status: "SUCCESS",
        },
      });
    }, 2000);
  });
};
