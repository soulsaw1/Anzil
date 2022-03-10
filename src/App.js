import React, { Component } from "react";
import { Switch, Route, Link, BrowserRouter as Router } from "react-router-dom";
import Login from "./components/Login";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import Cart from "./components/Cart";
import data from "./Data";
import Context from "./Context";
import logo from "./images/lo.png"

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      cart: {},
      products: []
    };

    this.routerRef = React.createRef();
  }
  login = (usn, pwd) => {
    let user = data.users.find(u => u.username === usn && u.password === pwd);
    if (user) {
      this.setState({ user });
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    }
    return false;
  };

  logout = e => {
    e.preventDefault();
    this.setState({ user: null });
    localStorage.removeItem("user");
  };

  addProduct = (product, callback) => {
    let products = this.state.products.slice();
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));
    this.setState({ products }, () => callback && callback());
  };

  addToCart = cartItem => {
    let cart = this.state.cart;
    if (cart[cartItem.id]) {
      cart[cartItem.id].amount += cartItem.amount;
    } else {
      cart[cartItem.id] = cartItem;
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.stock) {
      cart[cartItem.id].amount = cart[cartItem.id].product.stock;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

  checkout = () => {
    if (!this.state.user) {
      this.routerRef.current.history.push("/login");
      return;
    }
    const cart = this.state.cart;
    const products = this.state.products.map(p => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount;
      }
      return p;
    });
    this.setState({ products });
    this.clearCart();
  };

  removeFromCart = cartItemId => {
    let cart = this.state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

  clearCart = () => {
    let cart = {};
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

  componentDidMount() {
    let products = localStorage.getItem("products");
    let cart = localStorage.getItem("cart");
    let user = localStorage.getItem("user");
    products = products ? JSON.parse(products) : data.initProducts;
    cart = cart ? JSON.parse(cart) : {};
    user = user ? JSON.parse(user) : null;
    this.setState({ products, user, cart });
  }

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          login: this.login,
          addProduct: this.addProduct,
          clearCart: this.clearCart,
          checkout: this.checkout
        }}
      >
        <Router ref={this.routerRef}>
          <div className="App">
            <nav
              className="navbar container"
              role="navigation"
              aria-label="main navigation"
            >
              <div className="navbar-brand">
                <b className="navbar-item is-size-4 ">E-Commerce<img src="data:image/png;base64,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" alt=""/></b>

                <a
                  href="/"
                  role="button"
                  className="navbar-burger burger"
                  aria-label="menu"
                  aria-expanded="false"
                  data-target="navbarBasicExample"
                  onClick={e => {
                    e.preventDefault();
                    this.setState({ showMenu: !this.state.showMenu });
                  }}
                >
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                </a>
              </div>
              <div
                className={`navbar-menu ${
                  this.state.showMenu ? "is-active" : ""
                }`}
              >
                <Link to="/products" className="navbar-item">
                  Products
                </Link>
                {this.state.user && this.state.user.accessLevel < 1 && (
                  <Link to="/add-product" className="navbar-item">
                    Add Product
                  </Link>
                )}
                <Link to="/cart" className="navbar-item">
                  Cart
                  <span
                    className="tag is-primary"
                    style={{ marginLeft: "5px" }}
                  >
                    {Object.keys(this.state.cart).length}
                  </span>
                </Link>
                {!this.state.user ? (
                  <Link to="/login" className="navbar-item">
                    Login
                  </Link>
                ) : (
                  <a href="/" className="navbar-item" onClick={this.logout}>
                    Logout
                  </a>
                )}
              </div>
            </nav>

            <Switch>
              <Route exact path="/" component={ProductList} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/cart" component={Cart} />
              <Route exact path="/add-product" component={AddProduct} />
              <Route exact path="/products" component={ProductList} />
            </Switch>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}
