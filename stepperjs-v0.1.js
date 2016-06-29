function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function handlerForType(obj, e, type) {
  type    = capitalise(type);

  switch (type) {
    case 'Next':
    return obj.next;
    break;
    case 'Prev':
    return obj.prev;
    break;
    case 'Goto':
    return obj.goto;
    break;
    default:
    return 'all';
  }
}


function Step(name, func) {
  this.name = name;
  this.func = func;

  return this;
}

function Stepper(name) {
  this.name = name;
  this.startPoint = false;
  // Contains all added steps
  this.steps    = [new Step('StepperStartPoint', function() { this.startPoint = true; })];
  // Property that count the current step
  this.currStep = 0;
  // Number of added steps
  this.stepsNumber = 0;
  // Property used to know if stepper is or not rewindable
  this.rewind = false;
  // Track the last direction
  this.lastDirection = null;
  // Track the current direction
  this.currentDirection = null;
  /**
   * @rewindable(bool)
   * @bool: set rewind flag to true if true, false if bool is false
   **/
  this.rewindable = function(bool) {
    this.rewind = bool;
  }

  /**
   * @step(name, func)
   * @name: step's name
   * @func: step's func to execute
   **/
  this.step = function(name, func) {
    this.steps.push(new Step(name, func));
    this.stepsNumber++;

    return this;
  }

  /**
   * @next()
   * Execute next step but first check if it's alredy been executed the first()
   **/
  this.next = function() {
    if (this.currStep >= this.stepsNumber) {
      if (this.rewind)
        this.currStep = 1;
      this.steps[this.currStep].func();
    } else {
      this.currStep++;
      this.steps[this.currStep].func();
    }

    this.lastDirection = 'next';
    return this;
  }

  /**
   * @prev()
   * Execute prev step
   **/
  this.prev = function() {
    if (this.currStep == 1) {
      if (this.rewind)
        this.currStep = this.stepsNumber;
    } else {
      this.currStep--;
    }
    this.steps[this.currStep].func();
    this.lastDirection = 'prev';

    return this;
  }

  /**
    * @goto(<sN>)
    * <sN>: step number which have to executes
    * Execute prev step
    **/
  this.goto = function(sN) {
    this.currStep = sN;
    this.steps[this.currStep].func();
  }

  this.bindEvents = function(elements) {
    oldThis = this;

    this.handlerForAll = function(obj, e, type)  {
      switch (type) {
        case 'next':
          return obj.next;
          break;
        case 'prev':
          return obj.prev;
          break;
        case 'goto':
          var gotoN = e.dataset['stexGoto'];
          return obj.goto;
          break;
      }
    }

    Array.prototype.forEach.call(elements, function(e, i) {
      var type    = e.dataset['stexNext'] == undefined ? (e.dataset['stexPrev'] != undefined ? 'prev' : (e.dataset['stexGoto'] == undefined ? false : 'goto') ) : 'next';
      var trigger = e.dataset['stexTrigger'] != undefined ? e.dataset['stexTrigger'] : 'click' ;
      e.addEventListener(trigger, oldThis.handlerForAll(oldThis, e, type));
    });

    return this;
  }

  this.unbindEvents = function(elements) {
    // if (funcToCall != 'all') {
    Array.prototype.forEach.call(elements, function(e, i) {
      var trigger = e.dataset['stexTrigger'] != undefined ? e.dataset['stexTrigger'] : 'click' ;
      e.removeEventListener(trigger, this.handlerForAll);
    });

    return this;
  }

  /**
   * Rebinding function
   */
  this.rebindEvents = function (type, elements) {
    this.unbindEvents(elements)
      .bindEvents(elements);
  }

  /**
   * Bind events to the in DOM triggerers
   */
  // var tN = document.querySelectorAll('[data-stex-next]');
  // var tP = document.querySelectorAll('[data-stex-prev]');
  // var tG = document.querySelectorAll('[data-stex-goto]');
  this.tA = document.querySelectorAll('[data-stex-next], [data-stex-prev], [data-stex-goto]');
  this.bindEvents(this.tA);

  return this;
}
