const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

configure({
  generateMessage: localize('zh_TW'),
});

const apiUrl = 'https://vue3-course-api.hexschool.io';
const apiPath = 'jiangs2023';

const productDetailModal = {
	// 當 id 變動時，取得遠端資料，並呈現 Modal
	props: ['id','openModal','addToCart'],
	data() {
    return {
      modal: {},
      tempProduct: {},
      qty: 1,
    };
  },
	template: '#userProductModal',
	methods: {
    hide() {
      this.modal.hide();
    },
  },
	watch: {
    id() { // id 變動了
      console.log('productDetailModal:', this.id);
      if (this.id) {
        axios
          .get(`${apiUrl}/v2/api/${apiPath}/product/${this.id}`)
          .then((res) => {
            console.log('單一產品:', res.data.product);
            this.tempProduct = res.data.product;
            this.modal.show();
          });
      }
    },
  },
	mounted(){
		this.modal = new bootstrap.Modal(this.$refs.modal);
		// 監聽 DOM，當 Modal 關閉時...要做其他事情
    this.$refs.modal.addEventListener('hidden.bs.modal', (e) => {
      console.log('Modal 被關閉了');
      this.openModal(''); // 改 ID
    });
	}
};

const app = Vue.createApp({
	data() {
		return {
			products: [],
			cart: {},
			productId: '',
			loadingItem: '', // 存 id
			form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
					shipping : '',
        },
        message: '',
      },
			orders:[],
		};
	},
	components:{
		productDetailModal,
		VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
	},
	methods: {
		getProducts() {
			axios.get(`${apiUrl}/v2/api/${apiPath}/products/all`)
				.then(res => {
					console.log('產品列表:', res.data.products);
					this.products = res.data.products
				})
		},
		getCarts() {
			axios.get(`${apiUrl}/v2/api/${apiPath}/cart`)
				.then(res => {
					console.log('購物車:', res.data);
					this.cart = res.data.data;
				})
		},
		addToCart(product_id, qty = 1) {
			console.log(product_id, qty);
			// 當沒有傳入該參數時，會使用預設值
			const data = {
				product_id,
				qty,
			};
			axios.post(`${apiUrl}/v2/api/${apiPath}/cart`, { data })
				.then(res => {
					console.log('加入購物車', res.data);
					this.$refs.productDetailModal.hide();
					this.getCarts()
				})
		},
		updateCartItem(item) {
			// 購物車的 id, 產品的 id
			const data = {
				product_id: item.product.id,
				qty: item.qty,
			}
			axios.put(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`, { data })
				.then(res => {
					console.log('更新購物車', res.data);
					this.getCarts()
				})
		},
		deleteItem(id) {
			axios.delete(`${apiUrl}/v2/api/${apiPath}/cart/${id}`)
				.then(res => {
					console.log(res);
					this.getCarts()
				})
		},
		deleteAllItem() {
			axios.delete(`${apiUrl}/v2/api/${apiPath}/carts`)
				.then(res => {
					console.log(res);
					this.getCarts()
				})
		},
		openModal(product_id) {
			console.log(product_id);
			this.productId = product_id;
			console.log('外層帶入 productId:', product_id);
		},
		createOrder() {
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form;
      axios.post(url, { data: order }).then((response) => {
				console.log(response)
        alert(response.data.message);
        this.$refs.form.resetForm();
        this.getCarts();
      }).catch((err) => {
        alert(err.data.message);
      });
    },
		getOrders(){
			const url = `${apiUrl}/api/${apiPath}/orders`;
			axios.get(url)
				.then(res=>{
					console.log(res.data.orders)
					this.orders = res.data.orders
				})
		}
	},
	mounted() {
		this.getProducts();
		this.getCarts();
		// this.getOrders();
	},
})

app.mount('#app')