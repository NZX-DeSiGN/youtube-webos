import { configAddChangeListener, configRead } from './config.js';

function Clock() {
  this.initialized = false;
  this.$logo = this.getLogoElement();
  this.$clock = null;
  this.$clockText = null;
  this.observer = null;

  if (this.$logo && this.isLogoVisible()) {
    this.init();
    this.toggleClockVisibility(true);
  }

  this.watchLogoVisibility();
}

Clock.prototype.init = function () {
  this.createClock();
  this.updateClock();
  this.initialized = true;

  // REFACTOR THIS
  let self = this;
  setInterval(function () {
    self.updateClock();
  }, 10000);
};

Clock.prototype.destroy = function () {
  if (this.$clock) {
    document.body.removeChild(this.$clock);
  }

  if (this.observer) {
    this.observer.disconnect();
  }
};

Clock.prototype.getLogoElement = function () {
  return document.querySelector(
    '.ytlr-logo-entity--app-level.ytlr-logo-entity'
  );
};

Clock.prototype.watchLogoVisibility = function () {
  this.observer = new MutationObserver(this.logoVisibilityEvent.bind(this));
  this.observer.observe(document.body, { childList: true, subtree: true });
};

Clock.prototype.logoVisibilityEvent = function () {
  let $logo = this.getLogoElement();

  if (!$logo || $logo.offsetParent === null) {
    return this.toggleClockVisibility(false);
  }

  this.$logo = $logo;

  if (!this.initialized) {
    this.init();
  }

  this.toggleClockVisibility(true);
};

Clock.prototype.isLogoVisible = function () {
  const style = window.getComputedStyle(this.$logo);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
};

Clock.prototype.createClock = function () {
  let logoRect = this.$logo.getBoundingClientRect();

  this.$clock = document.createElement('div');
  this.$clockText = document.createElement('span');

  this.$clock.id = 'yt-tv-clock';
  this.$clock.style.position = 'absolute';
  this.$clock.style.display = 'flex';
  this.$clock.style.alignItems = 'center';
  this.$clock.style.justifyContent = 'flex-end';
  this.$clock.style.backgroundColor = '#0f0f0f';
  this.$clock.style.color = 'white';
  this.$clock.style.borderRadius = '5px';
  this.$clock.style.fontSize = '30px';
  this.$clock.style.zIndex = '1';
  this.$clock.style.display = 'none';
  this.$clock.style.top = logoRect.top + 'px';
  this.$clock.style.left = logoRect.left + 'px';
  this.$clock.style.width = logoRect.width + 'px';
  this.$clock.style.height = logoRect.height + 'px';

  let clockIcon = document.createElement('div');
  clockIcon.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" style="display:block"><path fill="#fff" fill-opacity=".16" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M12 6v5.844a.2.2 0 0 0 .152.194L16 13m6-1c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z"/></svg>';
  clockIcon.style.marginLeft = '15px';

  this.$clock.appendChild(this.$clockText);
  this.$clock.appendChild(clockIcon);
  document.body.appendChild(this.$clock);
};

Clock.prototype.toggleClockVisibility = function (value) {
  if (!this.$clock) {
    return;
  }

  this.$clock.style.display = value ? 'flex' : 'none';
};

Clock.prototype.updateClock = function () {
  let now = new Date();
  let hours = (now.getHours() < 10 ? '0' : '') + now.getHours();
  let minutes = (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
  this.$clockText.textContent = hours + ':' + minutes;
};

let clock = null;

if (configRead('showClock')) {
  clock = new Clock();
}

configAddChangeListener('showClock', (evt) => {
  const showClock = evt.detail.newValue;

  if (showClock) {
    clock = new Clock();
  } else {
    clock.destroy();
    clock = null;
  }
});
