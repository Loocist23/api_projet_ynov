const axios = require('axios');

axios.get('https://pocketbase.0shura.fr/api/collections/users/records', {
    params: {
        page: 1,
        perPage: 30
    }
})
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error('Error fetching paginated data:', error);
    });
