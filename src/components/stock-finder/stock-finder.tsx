import { Component, h, State, Element, EventEmitter, Event } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';
@Component({
  tag: 'fly-stock-finder',
  styleUrl: './stock-finder.css',
  shadow: true,
})
export class StockFinder {
  stockNameInput: HTMLInputElement;

  @Element() el: HTMLElement;

  @State() searchResults: { symbol: string; name: string }[] = [];

  @Event({ bubbles: true, composed: true }) flySymbolSelected: EventEmitter<string>;

  @State() isLoading = false;

  onFindStock(event: Event) {
    event.preventDefault();
    const stockName = this.stockNameInput.value;
    this.isLoading = true;
    fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        this.searchResults = data.bestMatches.map(match => {
          return {
            name: match['2. name'],
            symbol: match['1. symbol'],
          };
        });
        this.isLoading = false;
      })
      .catch(err => {
        console.error('Error', err);
        this.isLoading = false;
      });
  }

  onSelectSymbol(symbol: string) {
    this.flySymbolSelected.emit(symbol);
  }

  render() {
    let content = (
      <ul>
        {this.searchResults.map(item => {
          return (
            <li key={item.symbol} onClick={this.onSelectSymbol.bind(this, item.symbol)}>
              {item.symbol} - {item.name}
            </li>
          );
        })}
      </ul>
    );
    if (this.isLoading) {
      content = <fly-spinner />;
    }
    return (
      <div class="stock-finder">
        <form onSubmit={this.onFindStock.bind(this)}>
          <input id="stock-symbol-finder" ref={el => (this.stockNameInput = el)} />
          <button type="submit"> Find </button>
        </form>

        {content}
      </div>
    );
  }
}
