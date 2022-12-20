import { Component, h, State, Element, Prop, Watch, Listen } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';

@Component({
  tag: 'fly-stock-price',
  styleUrl: './stock-price.css',
  shadow: true,
})
export class StockPrice {
  stockInput: HTMLInputElement;
  initialStockSymbol: string;
  @Element() el: HTMLElement;

  @State() fetchPrice: number;

  @State() stockUserInput: string;
  @State() isStockInputValid = false;

  @State() isLoading = false;
  @State() error: string;

  @Prop({ mutable: true, reflect: true }) stockSymbol: string;

  @Watch('stockSymbol')
  stockSymbolChanged(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.stockUserInput = newValue;
      this.isStockInputValid = true;
      this.fetchStockPrice(newValue);
    }
  }

  // LifeCycles from stencils

  componentWillLoad() {}

  componentDidLoad() {
    if (this.stockSymbol) {
      this.initialStockSymbol = this.stockSymbol;
      this.stockUserInput = this.stockSymbol;
      this.isStockInputValid = true;
      this.fetchStockPrice(this.stockSymbol);
    }
  }

  componentWillUpdate() {}

  componentDidUpdate() {
    // if (this.stockSymbol !== this.initialStockSymbol) {
    //   this.fetchStockPrice(this.stockSymbol);
    // }
  }

  disconnectedCallback() {}

  @Listen('flySymbolSelected', { target: 'body' })
  onStockSymbolSelected(event: CustomEvent) {
    // listening from another web component
    // Listen simply listen events inside this component scope, So listening from
    // another component we need to add extra flags as below:::

    // if adding body:flySymbolSelected -> If this added then this emitted event  will buddle
    //  till body and then it can listen the event in here,,,,

    if (event.detail && event.detail !== this.stockSymbol) {
      this.stockSymbol = event.detail;
    }
  }

  fetchStockPrice(stockSymbol: string) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`;
    this.isLoading = true;
    fetch(url)
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Invalid');
        }
        return res.json();
      })
      .then(data => {
        if (!data['Global Quote']['05. price']) {
          throw new Error('Invalid Symbol');
        }
        var a = +data['Global Quote']['05. price'];
        this.fetchPrice = a;
        this.error = null;
        this.isLoading = false;
      })
      .catch(err => {
        this.error = err.message;
        this.fetchPrice = null;
        this.isLoading = false;
      });
  }

  onFetchStockPrice(event: Event) {
    // const stockSymbol = (this.el.shadowRoot.querySelector('#stock-symbol') as HTMLInputElement).value;

    event.preventDefault();
    this.stockSymbol = this.stockInput.value;
    this.fetchStockPrice(this.stockSymbol);
  }
  onUserInput = (event: Event) => {
    this.stockUserInput = (event.target as HTMLInputElement).value;
    if (this.stockUserInput.trim() !== '') {
      this.isStockInputValid = true;
    } else {
      this.isStockInputValid = false;
    }
  };

  //Add classes dynamically
  hostData() {
    return { class: this.error ? 'error' : '' };
  }

  render() {
    let dataContent = <p>Please enter a symbol</p>;

    if (this.error) {
      dataContent = <p>ERROR : {this.error}</p>;
    }

    if (!this.error && this.fetchPrice) {
      dataContent = <p>Price : {this.fetchPrice}</p>;
    }

    if (this.isLoading) {
      dataContent = <fly-spinner></fly-spinner>;
    }

    return (
      <div class="stock-price">
        <form onSubmit={this.onFetchStockPrice.bind(this)}>
          <input id="stock-symbol" ref={el => (this.stockInput = el)} value={this.stockUserInput} onInput={this.onUserInput} />
          <button type="submit" disabled={!this.isStockInputValid} class="stock-fetch">
            Fetch
          </button>
        </form>
        <div>{dataContent}</div>
      </div>
    );
  }
}
