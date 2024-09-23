export const configuration = (body:any) => {
    const token = localStorage.getItem("adminToken");
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "JWT " + token,
      },
      body: body,
    };
    return config;
  };
  
  
  
  