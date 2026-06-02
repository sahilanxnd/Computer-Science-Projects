var res = fetch('https://dummyjson.com/products?limit=150')
    .then(function (resp) {
        return resp.json();
    })
    .then(function (data) {
        let products = data.products;
        let photoCount = products.length;
        document.getElementById('item-count').textContent = `Number of photos : ${photoCount}`;

        let container = document.getElementById('container');
        let itemString = "";

        products.forEach(function (product) {
            itemString += `
                <div id="product-${product.id}" class="product-card">
                    <img class="product-img" src="${product.thumbnail}" alt="">
                    <p class="product-title">${product.title}</p>
                    <p class="product-price">${product.price}</p>
                </div>
            `;
        });

        container.innerHTML = itemString;

        [...document.getElementsByClassName('product-card')].forEach(e => {
            e.addEventListener('click', (e) => {
                let ele = e.currentTarget;
                let cnt = 100;

                let t = setInterval(() => {
                    cnt -= 10;
                    if (cnt < 10) {
                        clearInterval(t);
                        ele.remove();

                        photoCount--;
                        document.getElementById('item-count').textContent = `Number of photos : ${photoCount}`;
                    }
                }, 100);

                e.currentTarget.style.opacity = ".2";
            });
        });
    })
    .catch(function (err) {
        console.error(err);
    });
