function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function Step(name, func, number) {
  this.name = name;
  this.func = func;
  this.previous = number;

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
  // Array containing original elements without events binded
  this.originalNodes = [];
  // Track the binding state
  this.binded = false;

  /**
   * Handler to bind events
   */
   this.handlerForAll = function(obj, e, type) {
     switch (type) {
       case 'next':
         return obj.next;
         break;
       case 'prev':
         return obj.prev;
         break;
       case 'goto':
         return obj.goto;
         break;
       default:
        return 'all';
     }
   }


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
    this.steps.push(new Step(name, func, this.stepsNumber));
    this.stepsNumber++;

    return this;
  }

  /**
   * @next()
   * Execute next step but first check if it's alredy been executed the first()
   **/
  this.next = function(target) {
    if (this.currStep >= this.stepsNumber) {
      if (this.rewind)
      this.currStep = 1;
      this.steps[this.currStep].func(target);
    } else {
      this.currStep++;
      this.steps[this.currStep].func(target);
    }

    this.lastDirection = 'next';

    return this;
  }

  /**
   * @prev()
   * Execute prev step
   **/
  this.prev = function(target) {
    if (this.currStep <= 1) {
      if (this.rewind)
      this.currStep = this.stepsNumber;
    } else {
      this.currStep--;
    }
    this.steps[this.currStep].func(target);
    this.lastDirection = 'prev';

    return this;
  }

  /**
    * @goto(<sN>)
    * <sN>: step number which have to executes
    * Execute prev step
    **/
  this.goto = function(target, sN) {
    this.currStep = sN;
    this.steps[this.currStep].func(target);
  }

  this.handler = function(type, e) {
    switch (type) {
      case 'next':
        return oldThis.next(e);
        break;
      case 'prev':
        return oldThis.prev(e);
        break;
      case 'goto':
        var gotoN = e.dataset['stexGoto'];
        return oldThis.goto(e, gotoN);
        break;
    }
  }

  this.bindEvents = function(elements) {
    oldThis = this;

    Array.prototype.forEach.call(elements, function(e, i) {
      var type    = e.dataset['stexNext'] == undefined ? (e.dataset['stexPrev'] != undefined ? 'prev' : (e.dataset['stexGoto'] == undefined ? false : 'goto') ) : 'next';
      var trigger = e.dataset['stexTrigger'] != undefined ? e.dataset['stexTrigger'] : 'click' ;

      if (!e.dataset.binded) {
        oldThis.originalNodes[i] = e.cloneNode(true);

        e.dataset.binded = true;

        e.addEventListener(trigger, function (ev) {
          oldThis.handler(type, e);
        });

      }
    });

    return this;
  }

  this.unbindEvents = function(elements) {
    Array.prototype.forEach.call(elements, function(e, i) {
      var type    = e.dataset['stexNext'] == undefined ? (e.dataset['stexPrev'] != undefined ? 'prev' : (e.dataset['stexGoto'] == undefined ? false : 'goto') ) : 'next';
      var trigger = e.dataset['stexTrigger'] != undefined ? e.dataset['stexTrigger'] : 'click' ;
      if (oldThis.originalNodes[i] == undefined) {
        oldThis.originalNodes[i] = e;
      }
      e.parentNode.replaceChild(oldThis.originalNodes[i], e);
    });

    return this;
  }

  /**
   * Rebinding function
   */
  this.rebindEvents = function (elements) {
    this.bindEvents(elements);

    return this;
  }
  /**
   * Rebinding new step's triggers
   */
  this.bindNew = function (elements) {
    oldThis = this;

    if (Array.isArray(elements)) {
      Array.prototype.forEach.call(elements, function(e, i) {
        var type    = e.dataset['stexNext'] == undefined ? (e.dataset['stexPrev'] != undefined ? 'prev' : (e.dataset['stexGoto'] == undefined ? false : 'goto') ) : 'next';
        var trigger = e.dataset['stexTrigger'] != undefined ? e.dataset['stexTrigger'] : 'click' ;

        if (!e.dataset.binded) {
          oldThis.originalNodes.push(e.cloneNode(true));

          e.dataset.binded = true;

          e.addEventListener(trigger, function (ev) {
            oldThis.handler(type, e);
          });
        }
        return e;
      });
    } else {
      var type    = elements.dataset['stexNext'] == undefined ? (elements.dataset['stexPrev'] != undefined ? 'prev' : (elements.dataset['stexGoto'] == undefined ? false : 'goto') ) : 'next';
      var trigger = elements.dataset['stexTrigger'] != undefined ? elements.dataset['stexTrigger'] : 'click' ;

      if (!elements.dataset.binded) {
        oldThis.originalNodes.push(elements.cloneNode(true));

        elements.dataset.binded = true;

        elements.addEventListener(trigger, function (ev) {
          oldThis.handler(type, elements);
        });
      }
      return elements;
    }
  }

  /**
   * Bind events to the in DOM triggerers
   */
  this.tA = document.querySelectorAll('[data-stex-next], [data-stex-prev], [data-stex-goto]');
  this.bindEvents(this.tA);

  return this;
}
