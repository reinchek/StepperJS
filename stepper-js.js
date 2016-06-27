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
function StexObject(name, stepTriggers, domElement) {
    this.name = name;
    this.stepTriggers  = stepTriggers;
    this.domElement    = domElement;
    this.stepCounter   = 0;
    this.steps         = [];
    this.lastDirection = null;

    // Add Step
    this.addStep = function(name, func) {
        this.steps.push( {name: name, func: func} );
    }

    thisObj = this;

    $StexJS(stepTriggers).each(function(idx, el) {
        var trigger = '';
        if ($StexJS(el).data('stex-trigger') == undefined) {
            trigger = 'click';
        } else {
            trigger = $StexJS(el).data('stex-trigger');
        }
        $StexJS(el).bind(trigger, function(e) {
            // Event target
            var target = e.target;

            if ($StexJS(target).data('stex-next') != undefined) {
                // If the stepcounter reach the number of steps added restart from first
                if (thisObj.stepCounter == (thisObj.steps.length - 1)) {
                    // Execute the step before increment of stepCounter
                    thisObj.steps[thisObj.stepCounter].func(target);
                    thisObj.stepCounter = 0;
                    thisObj.lastDirection = "next";
                } else {
                    if (thisObj.lastDirection == "prev")
                        ++thisObj.stepCounter;

                    // Execute the step before increment of stepCounter
                    thisObj.steps[thisObj.stepCounter].func(target);
                    thisObj.stepCounter++;
                    thisObj.lastDirection = "next";
                }
            } else if ($StexJS(target).data('stex-prev') != undefined) {
                // If the stepcounter reach 0 restart from last
                if (thisObj.stepCounter == 0) {
                    // Execute the step before increment of stepCounter
                    thisObj.stepCounter = thisObj.steps.length - 1;
                    thisObj.steps[thisObj.stepCounter].func(target);
                    thisObj.lastDirection = "prev";
                } else {
                    // Execute the step before increment of stepCounter
                    if (thisObj.lastDirection == "next")
                        if (thisObj.stepCounter == 1 ) {
                            thisObj.stepCounter = thisObj.steps.length;
                        } else {
                            --thisObj.stepCounter;
                        }
                    thisObj.steps[--thisObj.stepCounter].func(target);
                    thisObj.lastDirection = "prev";
                }
            } else if ($StexJS(target).data('stex-goto') != undefined) {
                var goto = $StexJS(target).data('stex-goto');

                thisObj.stepCounter = goto;
                thisObj.steps[thisObj.stepCounter].func(target);
            }
        })
    });

    return this;
}

// Stex constructor
function Stex(dataStexName = false, trigger = false) {
    // Store this into thisStex variable to conserve original value.
    var stexs    = [];
    var allStexs = [];

    // If constructor hasn't parameters initialize all stexs in DOM
    if (!dataStexName && !trigger) {
        // Initi all .stex instances in DOM
        $StexJS('.stex').each(function(index, el) {
            var stexName  = $StexJS(el).data('stex');
            var stexStepTriggers = [];
            // Get all stepper's steps triggers (prev, next, goto)
            $StexJS(el).find('[data-stex-next],[data-stex-prev],[data-stex-goto]').each(function(idx, elem) {
                $StexJS(elem).attr('data-stex-parent', stexName);
                stexStepTriggers.push(elem);
            });

            // Create stex objects
            stexs[stexName] = new StexObject(stexName, stexStepTriggers, el);

            // Push into allStexs array
            allStexs.push(thisStex[stexName]);
        });

        return allStexs;
    }
    // Else if the constructor has parameters, initialize specified stex in DOM
    else {
        // Specified stex to initialize
        var stex       = $StexJS('[data-stex="' + dataStexName + '"]');
        // Stex's name in data-stex attr
        var stexName   = dataStexName;

        var stexStepTriggers = [];

        // Get all stepper's steps triggers (prev, next, goto)
        $StexJS(stex).find('[data-stex-next],[data-stex-prev],[data-stex-goto]').each(function(idx, el) {
            stexStepTriggers.push(el);
        });

        return new StexObject(stexName, stexStepTriggers, stex);
    }
}
