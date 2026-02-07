 // ✅ Bạn chỉ cần sửa danh sách này (img / title / price / link)
    const SPONSOR_PRODUCTS = [
      {
        title: "Hộp quà Đông Trùng Tiến Vua VIP02",
        price: 785000,
        img: "https://bizweb.dktcdn.net/thumb/large/100/515/845/products/chua-co-ten-600-x-600-px.png?v=1729495641097",
        link: "https://trungthaovaco.com/hop-qua-dong-trung-tien-vua-02"
      },
      {
        title: "Hộp quà Đông Trùng Tiến Vua VIP01",
        price: 575000,
        img: "https://bizweb.dktcdn.net/thumb/large/100/515/845/products/chua-co-ten-600-x-600-px.png?v=1729495641097",
        link: "https://trungthaovaco.com/hop-qua-sam-tien-vua-01"
      },
      {
        title: "Đông trùng hạ thảo khô 50g - Hũ thủy tinh",
        price: 630000,
        img: "https://bizweb.dktcdn.net/thumb/large/100/515/845/products/7-0d3b8d4c-a83a-4aa7-b664-b4c55476d8c4.png?v=1719215007783",
        link: "https://trungthaovaco.com/nam-dong-trung-ha-thao-vacofarm-hu-thuy-tinh-50g"
      },
      {
        title: "Đông trùng hạ thảo khô 30g - Hũ thủy tinh",
        price: 385000,
        img: "https://bizweb.dktcdn.net/thumb/large/100/515/845/products/6-b00c12ca-76a7-41f5-9ec7-0c16e530ce4c.png?v=1719215470373",
        link: "https://trungthaovaco.com/nam-dong-trung-ha-thao-vacofarm-hu-thuy-tinh-30g"
      }
    ];

    function formatVND(n) {
      try { return n.toLocaleString("vi-VN") + "đ"; }
      catch (e) { return n + "đ"; }
    }

    function renderGrid(list) {
      const grid = document.getElementById("spProductGrid");
      if (!grid) return;

      grid.innerHTML = list.map(p => `
        <div class="col-lg-3 col-md-6 mb-30">
          <a class="sp-product-card" href="${p.link || '#'}" ${p.link && p.link !== '#' ? '' : 'onclick="return false;"'}>
            <div class="sp-thumb">
              <img src="${p.img}" alt="${p.title}">
            </div>
            <h5 class="sp-p-title">${p.title}</h5>
            <div class="sp-p-price">${formatVND(p.price)}</div>
            <div class="sp-p-cta">Xem chi tiết <i class="fa fa-arrow-right"></i></div>
          </a>
        </div>
      `).join("");
    }

    function applySearchSort() {
      const q = (document.getElementById("spSearch")?.value || "").trim().toLowerCase();
      const sort = document.getElementById("spSort")?.value || "default";

      let list = SPONSOR_PRODUCTS.filter(p => p.title.toLowerCase().includes(q));

      if (sort === "name_asc") list.sort((a, b) => a.title.localeCompare(b.title, "vi"));
      if (sort === "name_desc") list.sort((a, b) => b.title.localeCompare(a.title, "vi"));
      if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
      if (sort === "price_desc") list.sort((a, b) => b.price - a.price);

      renderGrid(list);
    }

    renderGrid(SPONSOR_PRODUCTS);

    document.getElementById("spSearch")?.addEventListener("input", applySearchSort);
    document.getElementById("spSort")?.addEventListener("change", applySearchSort);