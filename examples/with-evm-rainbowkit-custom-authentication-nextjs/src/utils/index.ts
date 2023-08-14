export const simulateFetch = (): Promise<{ data: { status: string } }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        data: {
          status: "SUCCESS",
        },
      });
    }, 2000);
  });
};
