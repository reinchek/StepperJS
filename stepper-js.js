/**
 * Stex-JS
 * Options:
 *  - data-stex="<name>"             - <name>:  Stex's name on which execute different steps
 *  - data-stex-trigger="<event>"    - <event>: The event that trigger the next/prev/goto step function
 *  - data-stex-next                 - Go to the next stex function
 *  - data-stex-prev                 - Go to the previous stex function
 *  - data-stex-goto="<step>"        - Go to the step number <step>
 */

// Create a jQuery's alias
var $StexJS = jQuery.noConflict();

// Step Object
function Step(name, func) {
    this.name = name;
    this.function = func;
}

// StexObject
function StexObject(name, stepTriggers, domElement, reInitFunction) {
    // Stepper's Name
    this.name = name;
    // Stepper's triggers
    this.stepTriggers  = stepTriggers;
    // Stepper element in dom
    this.domElement     = domElement;
    this.stepCounter    = 0;
    this.steps          = [];
    this.lastDirection  = null;
    this.defaultTrigger = 'click';

    this.init = reInitFunction;

    // Add Step
    this.addStep = function(name, func) {
        this.steps.push( {name: name, func: func} );
        return this;
    }

    /***
    ** Binding method
    ***/
    this.bindTrigger = function(stex, target) {
        $StexJS(target).bind(stex.trigger, function(e) {
            // Event target
            var target = e.target;
            // Call nextStep
            if ($StexJS(target).data('stex-next') != undefined) {
                stex.nextStep(target);
            }
            // Call prevStep
            else if ($StexJS(target).data('stex-prev') != undefined) {
                stex.prevStep(target);
            }
            // Call gotoStep
            else if ($StexJS(target).data('stex-goto') != undefined) {
                var goto = $StexJS(target).data('stex-goto');
                stex.gotoStep(target, goto);
            }
        });
    }

    /***
     ** Go to next step
     ***/
    this.nextStep = function(target) {
        // If the stepcounter reach the number of steps added restart from first
        if (this.stepCounter == this.steps.length) {
            // Execute the step before increment of stepCounter
            this.stepCounter = 0;
            this.steps[this.stepCounter].func(target);
            this.lastDirection = "next";
        } else {

            // Execute the step before increment of stepCounter
            if (this.stepCounter == 0 && (this.lastDirection != null)) {
                this.steps[this.stepCounter++].func(target);
            } else {
                this.steps[this.stepCounter].func(target);
                this.stepCounter++;
            }

            this.lastDirection = "next";
        }
    }

    /***
     ** Go to previous step
     ***/
    this.prevStep = function(target) {
        // If the stepcounter reach 0 restart from last
        if (this.stepCounter == 0) {
            // Execute the step before increment of stepCounter
            this.stepCounter = this.steps.length - 1;
            this.steps[this.stepCounter].func(target);
            this.lastDirection = "prev";
        } else {
            // Execute the step before increment of stepCounter
            if (this.lastDirection == "next") {
                // if (this.stepCounter == this.steps.length) {
                //
                // }
                if (this.stepCounter == 1) {
                    this.stepCounter = this.steps.length;
                } else {
                    this.stepCounter -= 1;
                }
            }
            this.steps[this.stepCounter].func(target);
            this.lastDirection = "prev";
        }
    }

    /***
     ** Go to specified number step
     ***/
    this.gotoStep = function(target, step_num) {
        var goto   = step_num;
        this.stepCounter = goto;
        this.steps[this.stepCounter].func(target);
    }

    // Instantiates this in another variable before it will be rewritten
    var thisObj = this;

    $StexJS(stepTriggers).each(function(idx, el) {
        var trigger = '';
        if ($StexJS(el).data('stex-trigger') == undefined) {
            thisObj.trigger = thisObj.defaultTrigger;
        } else {
            thisObj.trigger = $StexJS(el).data('stex-trigger');
        }

        // Bind the step logic to the element
        thisObj.bindTrigger(thisObj, el);

    });

    return this;
}

// Stex constructor
function Stex(dataStexName = false, trigger = false) {
    // Store this into thisStex variable to conserve original value.
    var stexs    = [];
    var allStexs = [];

    this.init = function() {
        // Get all stepper's steps triggers (prev, next, goto)
        $StexJS(stex).find('[data-stex-next],[data-stex-prev],[data-stex-goto]').each(function(idx, el) {
            $StexJS(el).data('stex-added', true);
            $StexJS(el).addClass('stex-step-' + idx, stexName);
            stexStepTriggers.push(el);
        });

        return new StexObject(stexName, stexStepTriggers, stex, this.init);
    }

    // If constructor hasn't parameters initialize all stexs in DOM
    // if (!dataStexName && !trigger) {
    //     // Initi all .stex instances in DOM
    //     $StexJS('.stex').each(function(index, el) {
    //         var stexName  = $StexJS(el).data('stex');
    //         var stexStepTriggers = [];
    //         // Get all stepper's steps triggers (prev, next, goto)
    //         $StexJS(el).find('[data-stex-next],[data-stex-prev],[data-stex-goto]').each(function(idx, elem) {
    //             $StexJS(elem).data('stex-added', true);
    //             $StexJS(elem).addClass('stex-step-' + idx, stexName);
    //             $StexJS(elem).attr('data-stex-parent', stexName);
    //             stexStepTriggers.push(elem);
    //         });
    //
    //         // Create stex objects
    //         stexs[stexName] = new StexObject(stexName, stexStepTriggers, el);
    //
    //         // Push into allStexs array
    //         allStexs.push(thisStex[stexName]);
    //     });
    //
    //     return allStexs;
    // }

    // Else if the constructor has parameters, initialize specified stex in DOM
    // else {
    // Specified stex to initialize
    var stex       = $StexJS('[data-stex="' + dataStexName + '"]');
    // Stex's name in data-stex attr
    var stexName   = dataStexName;

    var stexStepTriggers = [];

    // Get all stepper's steps triggers (prev, next, goto)
    return this.init();
    // }
}
