const HERE_API_TOKEN = process.env.NEXT_PUBLIC_HERE_API_TOKEN;

export function hereGeocode(address: string) {
    return new Promise((resolve, reject) => {
      const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
        address
      )}&apiKey=${HERE_API_TOKEN}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log("Geocoding response:", data);
          if (data.items.length > 0) {
            resolve(data.items[0]);
          } else {
            reject(
              "No s'ha trobat l'adreça. Introdueix una adreça més específica."
            );
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  
  export function hereReverseGeocode(lat: number, lng: number) {
    return new Promise((resolve, reject) => {
      const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&apiKey=${HERE_API_TOKEN}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.items.length > 0) {
            resolve(data.items[0]);
          } else {
            reject("No s'ha trobat l'adreça.");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }