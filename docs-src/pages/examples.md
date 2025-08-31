---
title: 'Examples'
emoji: '🍽️'
description: 'Common use cases and demos'
---

<section-hero>

# 🍽️ Examples & Recipes

<div>
  <p class="lead">Discover practical examples and patterns for building reactive, modular components with UIElement. Each example focuses on showcasing a specific feature or best practice, guiding you through real-world use cases.</p>
  {{ toc }}
</div>
</section-hero>

<section>

## Counter

A simple click counter. Gets initial value from inner `span` element and increments it on click.

<module-demo>
  <div class="preview">
    <basic-counter>
       <button type="button">💐 <span>5</span></button>
    </basic-counter>
  </div>
  <details>
    <summary>Source Code</summary>
    <module-lazy src="./examples/basic-counter.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>

<section>

## Number Formatter

Display a number with a specific format using `Intl.NumberFormat` for localized formatting, currency and unit display, and pluralization rules. Gets locale from the component's or inherited `lang` attribute. Full support for all options of `Intl.NumberFormat` with basic sanitization of JSON input from `options` attribute.

<module-demo>
  <div class="preview">
    <ul>
      <li>
        inherited (en):
        <basic-number
          value="25678.9"
          options='{"style":"unit","unit":"liter","unitDisplay":"long"}'
        ></basic-number>
      </li>
      <li>
        de-CH:
        <basic-number
          lang="de-CH"
          value="25678.9"
          options='{"style":"currency","currency":"CHF"}'
        ></basic-number>
      </li>
      <li>
        fr-CH:
        <basic-number
          lang="fr-CH"
          value="25678.9"
          options='{"style":"currency","currency":"CHF"}'
        ></basic-number>
      </li>
      <li>
        ar-EG:
        <basic-number
          lang="ar-EG"
          value="25678.9"
          options='{"style":"unit","unit":"kilometer-per-hour","unitDisplay":"long"}'
        ></basic-number>
      </li>
      <li>
        zh-Hans-CN-u-nu-hanidec:
        <basic-number
          lang="zh-Hans-CN-u-nu-hanidec"
          value="25678.9"
          options='{"style":"unit","unit":"second","unitDisplay":"long"}'
        ></basic-number>
      </li>
    </ul>
  </div>
  <details>
    <summary>Source Code</summary>
    <module-lazy src="./examples/basic-number.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>

<section>

## Pagination

<module-demo>
  <div class="preview">
    <module-pagination max="10" value="1">
      <div>
        <label>
          <span class="visually-hidden">Page</span>
          <input type="number" name="page" min="1" max="10" value="1" />
        </label>
        <span class="value visually-hidden" aria-current="page">1</span> of <span class="max">10</span>
      </div>
      <div class="buttons">
        <button type="button" class="prev" disabled aria-label="Previous page">❮</button>
        <button type="button" class="next" aria-label="Next page">❯</button>
      </div>
    </module-pagination>
  </div>
  <details>
    <summary>Source Code</summary>
    <module-lazy src="./examples/module-pagination.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>

<section>

## Color Scale and Info

<module-demo>
  <div class="preview">
    <module-colorinfo color="#36a2de">
      <card-colorscale color="#36a2de" class="medium">
        <ol role="presentation">
          <li class="lighten80"></li>
          <li class="lighten60"></li>
          <li class="lighten40"></li>
          <li class="lighten20"></li>
          <li class="base">
            <span class="label">
              <strong>Blue</strong>
              <small>#36a2de</small>
            </span>
          </li>
          <li class="darken20"></li>
          <li class="darken40"></li>
          <li class="darken60"></li>
          <li class="darken80"></li>
        </ol>
      </card-colorscale>
      <details>
        <summary>
          <div class="summary">
            <span class="swatch"></span>
            <span class="label">
              <strong>Blue</strong>
              <small class="value">#36a2de</small>
            </span>
          </div>
        </summary>
        <div class="details">
          <dl>
            <dt>Lightness:</dt>
            <dd class="lightness"></dd>
            <dt>Chroma:</dt>
            <dd class="chroma"></dd>
            <dt>Hue:</dt>
            <dd class="hue"></dd>
          </dl>
          <dl>
            <dt>OKLCH:</dt>
            <dd class="oklch"></dd>
            <dt>RGB:</dt>
            <dd class="rgb"></dd>
            <dt>HSL:</dt>
            <dd class="hsl"></dd>
            </dl>
          </div>
      </details>
    </module-colorinfo>
  </div>
  <details>
    <summary>CardColorscale Source Code</summary>
    <module-lazy src="./examples/card-colorscale.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
  <details>
    <summary>ModuleColorinfo Source Code</summary>
    <module-lazy src="./examples/module-colordetails.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>

<section>

## Gauge

<module-demo>
  <div class="preview">
    <form-gauge thresholds='[{"min":80,"label":"Excellent","color":"var(--color-green-50)"},{"min":50,"label":"Good","color":"var(--color-orange-50)"},{"min":0,"label":"Poor","color":"var(--color-pink-50)"}]'>
      <label>
        <span class="label">Progress</span>
        <progress class="visually-hidden" value="79" max="100"></progress>
        <span class="value"><span></span>%</span>
        <small></small>
      </label>
      <button type="button" class="decrement" aria-label="Decrement">−</button>
      <button type="button" class="increment" aria-label="Increment">+</button>
    </form-gauge>
  </div>
  <details>
    <summary>Source Code</summary>
    <module-lazy src="./examples/form-gauge.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>

<section>

## Carousel

Fully accessible and responsive carousel component.

<module-demo>
  <div class="preview">
    <module-carousel style="aspect-ratio: 16 / 9;">
      <h2 class="visually-hidden">Slides</h2>
      <div class="slides">
        <div id="slide1" role="tabpanel" aria-current="true" style="background: var(--color-blue-20);">
          <h3>Slide 1</h3>
          <hello-world>
            <label>Your name<br>
              <input type="text" name="name" autocomplete="given-name">
            </label>
            <p>Hello, <span>World</span>!</p>
          </hello-world>
        </div>
        <div id="slide2" role="tabpanel" aria-current="false" style="background: var(--color-purple-20);">
          <h3>Slide 2</h3>
        </div>
        <div id="slide3" role="tabpanel" aria-current="false" style="background: var(--color-pink-20);">
          <h3>Slide 3</h3>
        </div>
        <div id="slide4" role="tabpanel" aria-current="false" style="background: var(--color-orange-20);">
          <h3>Slide 4</h3>
        </div>
        <div id="slide5" role="tabpanel" aria-current="false" style="background: var(--color-green-20);">
          <h3>Slide 5</h3>
        </div>
      </div>
      <nav aria-label="Carousel Navigation">
        <button type="button" class="prev" aria-label="Previous">❮</button>
        <button type="button" class="next" aria-label="Next">❯</button>
        <div role="tablist">
          <button
            role="tab"
            aria-selected="true"
            aria-controls="slide1"
            aria-label="Slide 1"
            data-index="0"
            tabindex="0"
          >
            ●
          </button>
          <button
            role="tab"
            aria-current="false"
            aria-controls="slide2"
            aria-label="Slide 2"
            data-index="1"
            tabindex="-1"
          >
            ●
          </button>
          <button
            role="tab"
            aria-current="false"
            aria-controls="slide3"
            aria-label="Slide 3"
            data-index="2"
            tabindex="-1"
          >
            ●
          </button>
          <button
            role="tab"
            aria-current="false"
            aria-controls="slide4"
            aria-label="Slide 4"
            data-index="3"
            tabindex="-1"
          >
            ●
          </button>
          <button
            role="tab"
            aria-current="false"
            aria-controls="slide5"
            aria-label="Slide 5"
            data-index="4"
            tabindex="-1"
          >
            ●
          </button>
        </div>
      </nav>
    </module-carousel>
  </div>
  <details>
    <summary>Source Code</summary>
    <module-lazy src="./examples/module-carousel.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>

<section>

## Combobox

A combobox component that allows users to select an option from a list.

<module-demo>
  <div class="preview">
    <form-combobox value="">
      <label for="city-input">Choose a city</label>
      <div class="input">
        <input
          id="city-input"
          type="text"
          role="combobox"
          aria-expanded="false"
          aria-controls="city-popup"
          aria-autocomplete="list"
          autocomplete="off"
          required
        />
        <ol id="city-popup" role="listbox" hidden>
          <li role="option" tabindex="-1">Amsterdam</li>
          <li role="option" tabindex="-1">Berlin</li>
          <li role="option" tabindex="-1">Copenhagen</li>
          <li role="option" tabindex="-1">Dublin</li>
          <li role="option" tabindex="-1">Edinburgh</li>
          <li role="option" tabindex="-1">Frankfurt</li>
          <li role="option" tabindex="-1">Geneva</li>
          <li role="option" tabindex="-1">Helsinki</li>
          <li role="option" tabindex="-1">Istanbul</li>
          <li role="option" tabindex="-1">Jakarta</li>
          <li role="option" tabindex="-1">Kairo</li>
          <li role="option" tabindex="-1">London</li>
          <li role="option" tabindex="-1">Madrid</li>
          <li role="option" tabindex="-1">New York</li>
          <li role="option" tabindex="-1">Oslo</li>
          <li role="option" tabindex="-1">Paris</li>
          <li role="option" tabindex="-1">Qingdao</li>
          <li role="option" tabindex="-1">Rome</li>
          <li role="option" tabindex="-1">Stockholm</li>
          <li role="option" tabindex="-1">Tokyo</li>
          <li role="option" tabindex="-1">Ulan Bator</li>
          <li role="option" tabindex="-1">Vienna</li>
          <li role="option" tabindex="-1">Warsaw</li>
          <li role="option" tabindex="-1">Xi'an</li>
          <li role="option" tabindex="-1">Yokohama</li>
          <li role="option" tabindex="-1">Zurich</li>
        </ol>
        <button type="button" class="clear" aria-label="Clear input" hidden>
          ✕
        </button>
      </div>
      <p class="error" aria-live="assertive" id="city-error"></p>
      <p class="description" aria-live="polite" id="city-description">Tell us where you live so we can set your timezone for our calendar and notification features.</p>
    </form-combobox>
  </div>
  <details>
    <summary>Source Code</summary>
    <module-lazy src="./examples/form-combobox.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>

<section>

## Dialog

<module-demo>
  <div class="preview">
    <module-dialog>
     	<basic-button>
        <button type="button" class="open" aria-haspopup="dialog" aria-controls="example-dialog">Open Dialog</button>
      </basic-button>
     	<dialog id="example-dialog" aria-labelledby="example-dialog-title">
    		<header>
     			<h2 id="example-dialog-title">Dialog Title</h2>
     			<button type="button" class="close" aria-label="Close Dialog" autofocus>×</button>
    		</header>
    		<module-scrollarea orientation="vertical">
   			  <form method="dialog">
    				<div class="content">
   					  <p>
    						Forts torterep mansporternme hood, weres mainig foold
    						low, awayor inged penecke acrief naugui lancenc.
    						Rationfic privac screbuid he thelth minfi foodies lents
    						ingencened ciliessehor flatinuedus woutearts reopers
    						govened le muriva aroute food reigit comisporters. Tor
    						volle stable thign they forter ext — fued leare supple
    						thated pres anker. Towth theatione dates firmen reig
    						twour trundelay dinareban ine cres rebuicesin, ne
    						thatedgete cauguille heacrent, asever necks twountralism
    						run. Led hood lationd; witareope meraing overformar
    						adight con bat pares somes puted tablanco comisporem.
    						Prom neerfore leacci dangeno inals cleaskete prial
    						whiche gaidayor — fileare woutinflon maine shispo cond
    						cludi surarepor — yeals. Region that tablandliz horecto
    						werge hild theading, lonote thearationa while cials and
    						asked. Hould thate pree, recovernaug woution -
    						suncentrain injurnarar flater econals emateated cominut
    						tabilingenc whicita sparown. Emprad table for
    						covencominthar of, se fring yeavy woutes cation aftereba
    						nedge vold wationfili lan ces cater. Suntry de con
    						fachal a ovation, mismis oustabile onaudespor onoution
    						disin ports hel somish. Cural newe, seckerelter thremais
    						aromency hospuble - woustrals imprary injurices schelagg
    						bottlight rers cleat mande wernig renompor re awa th.
    						Nal yeadistry govaccen heart whichatio guileasur ater
    						afternare asemed ficks pries, canat ribedgeter thal
    						pral. Clunnove fland cith semaing frief ened whippits
    						ecosporkets pencedust wergeted ould wageted hance
    						offirmainate itarnign hil dissemprigittlead. Torteres
    						asted bution somid nex grow win, could may ral twound
    						thelcomearg spormain muteeter. Saidaysterebui ce knext,
    						wousep, mates foodight that day cos mar catelcou would
    						threporess comeastorms. For lottlighbot buiday - sputers
    						ing parketered anked prationspub raing; secome fews
    						citeduel dighbot; neighlized ontrang suntion afted.
    						Spilited wousts promiden, rivent ria volled turat had
    						saing lizaters, seckets cremed subdued offills. Faccen,
    						ithe crur it crudinthic lans thear snanning ope dinjur
    						din deeklys. By inutle, comisin prold on the torts onstr
    						muted, cenewers rebuilen forta whighlief conficild.
    						Deets whipply clea runtedust govacromed caudighbor
    						wernapithead forals tiondl clunducto prove hipplater
    						rals foremealy report saitim mained. Ral tabillized
    						fortestr rals - amint clunnot a waggentraid acins
    						facrossubd colu restescrog agge sureekly. Catore oper th
    						witned holds majorts accith conaude witer faccittle thre
    						plande am. Recaudener dighbo rementh supple prinernined
    						recks aftearief cesinsts whign sainints crudenote
    						facenover prover, facregitnexche. Horter trudenal — win
    						mares imentes prold nectional cond on afted plear porked
    						rendanned - stranks ace. Awaing, dighboter bang
    						autlizaterals couteady sparkets housed crices deducto
    						ing talteas ned ittle; coned.
   					  </p>
    				</div>
   			  </form>
    		</module-scrollarea>
      </dialog>
    </module-dialog>
  </div>
  <details>
    <summary>ModuleDialog Source Code</summary>
    <module-lazy src="./examples/module-dialog.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
  <details>
    <summary>ModuleScrollarea Source Code</summary>
    <module-lazy src="./examples/module-scrollarea.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>

<section>

## Todo App

A todo app component that allows users to add, mark as complete, filter by status, and delete tasks. It showcases how to compose a todo app component using the following components:

- `<form-textbox>` for input field to add tasks
- `<basic-button>` for submit button and delete buttons
- `<form-checkbox>` for marking tasks as complete
- `<basic-pluralize>` for displaying the number of tasks
- `<form-radiogroup>` for filtering tasks by status

<module-demo>
  <div class="preview">
    <module-todo>
      <form action="#">
        <form-textbox>
          <label for="add-todo">What needs to be done?</label>
          <div class="input">
            <input id="add-todo" type="text" value="" />
          </div>
        </form-textbox>
        <basic-button class="submit">
          <button type="submit" class="constructive" disabled>
            <span class="label">Add Todo</span>
          </button>
        </basic-button>
      </form>
      <ol filter="all"></ol>
      <template>
        <li>
          <form-checkbox class="todo">
            <label>
              <input type="checkbox" class="visually-hidden" />
              <span class="label"><slot></slot></span>
            </label>
          </form-checkbox>
          <basic-button class="delete">
            <button type="button" class="tertiary destructive small" aria-label="Delete">
              <span class="label">✕</span>
            </button>
          </basic-button>
        </li>
      </template>
      <footer>
        <basic-pluralize>
          <p class="none">Well done, all done!</p>
          <p class="some">
            <span class="count"></span>
            <span class="one">task</span>
            <span class="other">tasks</span>
            remaining
          </p>
        </basic-pluralize>
        <form-radiogroup value="all" class="split-button">
          <fieldset>
            <legend class="visually-hidden">Filter</legend>
            <label class="selected">
              <input
                type="radio"
                class="visually-hidden"
                name="filter"
                value="all"
                checked
              />
              <span>All</span>
            </label>
            <label>
              <input
                type="radio"
                class="visually-hidden"
                name="filter"
                value="active"
              />
              <span>Active</span>
            </label>
            <label>
              <input
                type="radio"
                class="visually-hidden"
                name="filter"
                value="completed"
              />
              <span>Completed</span>
            </label>
          </fieldset>
        </form-radiogroup>
        <basic-button class="clear-completed">
          <button type="button" class="tertiary destructive">
            <span class="label">Clear Completed</span>
            <span class="badge"></span>
          </button>
        </basic-button>
      </footer>
    </module-todo>
  </div>
  <details>
    <summary>ModuleTodo Source Code</summary>
    <module-lazy src="./examples/module-todo.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
  <details>
    <summary>FormTextbox Source Code</summary>
    <module-lazy src="./examples/form-textbox.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
  <details>
    <summary>BasicButton Source Code</summary>
    <module-lazy src="./examples/basic-button.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
  <details>
    <summary>FormCheckbox Source Code</summary>
    <module-lazy src="./examples/form-checkbox.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
  <details>
    <summary>BasicPluralize Source Code</summary>
    <module-lazy src="./examples/basic-pluralize.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
  <details>
    <summary>FormRadiogroup Source Code</summary>
    <module-lazy src="./examples/form-radiogroup.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>

<section>

## Lazy Loading

This example shows how to handle asynchronous data loading and error states. Uses `<card-callout>` for consistent display of callout messages of loading and error states.

<module-demo>
  <div class="preview">
    <module-lazy src="./examples/module-lazy.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </div>
  <details>
    <summary>ModuleLazy Source Code</summary>
    <module-lazy src="./examples/module-lazy.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
  <details>
    <summary>CardCallout Source Code</summary>
    <module-lazy src="./examples/card-callout.html">
      <card-callout>
        <p class="loading" role="status">Loading...</p>
        <p class="error" role="alert" aria-live="polite"></p>
      </card-callout>
    </module-lazy>
  </details>
</module-demo>

</section>
