import { Component, h } from '@stencil/core';
@Component({
  tag: 'fly-spinner',
  styleUrl: './spinner.css',
  shadow: true,
})
export class Spinner {
  render() {
    return (
      <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
}
