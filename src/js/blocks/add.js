"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
(function ($, Drupal, drupalSettings) {
  /**
   * Create agenda.
   */
  Drupal.behaviors.edugouvAgenda = {
    attach: function attach(context) {
      $('.js-agenda', context).once('edugouvAgenda').each(function (index, element) {
        var Agenda = /*#__PURE__*/function () {
          // Get initial data.
          function Agenda($obj) {
            _classCallCheck(this, Agenda);
            this.lang = drupalSettings.path ? drupalSettings.path.currentLanguage : 'en';
            this.viewTypes = {
              monthly: 'Month',
              weekly: 'Week',
              daily: 'Day'
            };
            this.cachedData = {};
            this.cachedDates = {};
            this.accessibleType = 'weekly';
            this.viewType = $obj.data('view-type') ? $obj.data('view-type') : 'monthly';
            this.gapDays = $obj.data('gap-days') ? $obj.data('gap-days') : 5;
            this.$this = $obj;
            this.currentDate = new Date();
            this.calendarStartDate = new Date();
            this.calendarEndDate = new Date();
            this.noFutureEvents = null;
            this.$main = $(Drupal.theme('agendaMainStructure')).appendTo(this.$this);
            this.$header = $('.agenda__header', this.$main);
            this.$content = $('.agenda__content', this.$main);
            this.$viewTypeWrapper = $('.agenda__view__wrapper', this.$main);
            this.$typeWrapper = $('.agenda__types__wrapper', this.$main);
            this.$accessibleTypeWrapper = $('.agenda__types__wrapper--accessible', this.$main);
            this.$accessibleEvents = $('.agenda__events', this.$main);
            this.$viewport = $('.viewport', this.$main);
            this.$scrollWrapper = this.$viewport.parent();
            this.daySeconds = 86400000; // 1000 * 60 * 60 * 24
            this.hourSeconds = 3600000; // 1000 * 60 * 60
            this.rows = {};
            this.accessibleRows = {};
            this.dates = this.fillDates(this.viewType);
            this.accessibleDates = this.fillDates(this.accessibleType);
            this.$scrollWrapper.tinyscrollbar({
              axis: 'x',
              wheel: false
            });
          }

          // Get rows from api or from cached data if it was got before.
          _createClass(Agenda, [{
            key: "getRows",
            value: function getRows() {
              var _this = this;
              var basePath = drupalSettings.path ? drupalSettings.path.baseUrl : '/';
              var eventTypes = this.$this.data('event-types').join('+');
              var personality = this.$this.data('personality') ? this.$this.data('personality') : '';
              this.$this.addClass('loading');
              $.get("".concat(basePath, "api/v1/agenda/").concat(this.viewType, "?types=").concat(eventTypes, "&personality=").concat(personality)).done(function (response) {
                _this.rows = response.data;
                _this.cachedData[_this.viewType] = response.data;
                _this.currentDate = new Date(response.currentDate);
                if (response.pagerFrom) {
                  _this.calendarStartDate = new Date(response.pagerFrom);
                  _this.calendarEndDate = new Date(response.pagerTo);
                } else {
                  var date = new Date();
                  if (!response.noFutureEvents) {
                    date = new Date(response.firstEventStartDate);
                  }
                  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  if (_this.viewType === 'daily') {
                    firstDay = new Date(date.getTime() - _this.daySeconds);
                    lastDay = date;
                  } else if (_this.viewType === 'weekly') {
                    var curDay = date.getDate() + (1 - date.getDay());
                    var curMon = new Date(date.getFullYear(), date.getMonth(), curDay).getTime();
                    firstDay = new Date(curMon - _this.daySeconds * 7);
                    lastDay = new Date(date.setDate(date.getDate() - date.getDay() + 7));
                  }
                  _this.calendarStartDate = firstDay;
                  _this.calendarEndDate = lastDay;
                }
                if (response.noFutureEvents) {
                  $('.agenda-next', _this.$main).hide();
                } else {
                  $('.agenda-next', _this.$main).show();
                }
                _this.noFutureEvents = response.noFutureEvents;
                _this.dates = _this.fillDates(_this.viewType);
                _this.render();
                _this.$scrollWrapper.attr('data-start', response.calendarStartDate);
                _this.$scrollWrapper.attr('data-end', response.calendarEndDate);
                _this.$scrollWrapper.data('plugin_tinyscrollbar').update();
              }).fail(function (error) {
                throw new Error(error);
              }).always(function () {
                setTimeout(function () {
                  _this.$this.removeClass('loading');
                }, 1100);
              });
            }

            // Get rows for accessible version.
          }, {
            key: "getAccessibleRows",
            value: function getAccessibleRows() {
              var _this2 = this;
              if (this.cachedData[this.accessibleType]) {
                this.accessibleRows = this.cachedData[this.accessibleType];
                this.renderAccessible();
              } else {
                var basePath = drupalSettings.path ? drupalSettings.path.baseUrl : '/';
                var eventTypes = this.$this.data('event-types').join('+');
                var personality = this.$this.data('personality') ? this.$this.data('personality') : '';
                $.get("".concat(basePath, "api/v1/agenda/").concat(this.accessibleType, "?types=").concat(eventTypes, "&personality=").concat(personality, "&accessible=1")).done(function (response) {
                  _this2.cachedData[_this2.accessibleType] = response.data;
                  _this2.accessibleRows = response.data;
                  var today = new Date().getTime();
                  var startRequest = today - _this2.daySeconds * 84;
                  var endRequest = today + _this2.daySeconds * 84;
                  _this2.calendarStartDate = new Date(startRequest);
                  _this2.calendarEndDate = new Date(endRequest);
                  _this2.accessibleDates = _this2.fillDates(_this2.accessibleType);
                  _this2.renderAccessible();
                }).fail(function (error) {
                  throw new Error(error);
                });
              }
            }

            // Render all elements.
          }, {
            key: "render",
            value: function render() {
              this.$header.empty();
              this.$content.empty();
              this.$typeWrapper.empty();
              this.$viewTypeWrapper.empty();
              this["generate".concat(this.viewTypes[this.viewType], "Header")]();
              this.generateContent();
              this.generateViewTypeSelector();
              this.$scrollWrapper.data('plugin_tinyscrollbar').update();
              this.setViewportHeight();
              this.bindArrowsSwitcher();
              this.bindPopupSwitcher();
            }

            // Bind events for arrows switcher.
          }, {
            key: "bindArrowsSwitcher",
            value: function bindArrowsSwitcher() {
              var _this3 = this;
              $('.custom-scrollbar-wrapper').each(function (ind, elem) {
                var scroll = _this3.$scrollWrapper.data('plugin_tinyscrollbar');
                var agendaDay = $(elem).find('.agenda__day.today').index();
                var agendaMonth = $(elem).find('.agenda__header__month');
                var length = 0;
                if (agendaMonth.length) {
                  length = agendaMonth.width() * $(elem).find('.agenda__day.today').closest('.agenda__header__month').index();
                } else {
                  length = agendaDay * $(elem).find('.agenda__day').width();
                }
                scroll.update(length);
                var $arrow = $(elem).find('.agenda__buttons button');
                $arrow.on('click', function (e) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  var basePath = drupalSettings.path ? drupalSettings.path.baseUrl : '/';
                  var eventTypes = $(e.target).closest('.js-agenda').data('event-types').join('+');
                  var personality = $(e.target).closest('.js-agenda').data('personality') ? _this3.$this.data('personality') : '';
                  var firstVisibleDate = new Date($(e.target).closest('.custom-scrollbar-wrapper').find('.agenda__header .agenda__day').first().attr('data-date') + ' 01:00:00').getTime();
                  var lastVisibleDate = new Date($(e.target).closest('.custom-scrollbar-wrapper').find('.agenda__header .agenda__day').last().attr('data-date') + ' 01:00:00').getTime();
                  $(e.target).closest('.js-agenda').addClass('loading');
                  var startRequest = (lastVisibleDate + _this3.daySeconds) / 1000;
                  var endRequest = new Date();
                  _this3.$main = $(e.target).closest('.js-agenda');
                  _this3.$header = $('.agenda__header', _this3.$main);
                  _this3.$content = $('.agenda__content', _this3.$main);
                  _this3.$viewTypeWrapper = $('.agenda__view__wrapper', _this3.$main);
                  _this3.$typeWrapper = $('.agenda__types__wrapper', _this3.$main);
                  _this3.$viewport = $('.viewport', _this3.$main);
                  _this3.viewType = $(e.target).closest('.js-agenda').attr('data-view-type');
                  if (_this3.viewType === 'daily') {
                    endRequest = (lastVisibleDate + _this3.daySeconds * 2) / 1000;
                  } else if (_this3.viewType === 'weekly') {
                    endRequest = (lastVisibleDate + _this3.daySeconds * 14) / 1000;
                  } else {
                    var oldYear = new Date(lastVisibleDate).getFullYear();
                    var oldMonth = new Date(lastVisibleDate).getMonth();
                    var newDate = oldMonth === 11 ? new Date(oldYear + 1, 1, 0, 1) : new Date(oldYear, oldMonth + 2, 0, 1);
                    endRequest = newDate.getTime() / 1000;
                  }
                  if ($(e.target).hasClass('agenda-prev')) {
                    endRequest = (firstVisibleDate - _this3.daySeconds) / 1000;
                    if (_this3.viewType === 'daily') {
                      startRequest = (firstVisibleDate - _this3.daySeconds * 2) / 1000;
                    } else if (_this3.viewType === 'weekly') {
                      startRequest = (firstVisibleDate - _this3.daySeconds * 14) / 1000;
                    } else {
                      var oldFirst = new Date(firstVisibleDate);
                      startRequest = new Date(oldFirst.setMonth(oldFirst.getMonth() - 1)).getTime() / 1000;
                    }
                  }
                  $.get("".concat(basePath, "api/v1/agenda/").concat(_this3.viewType, "?types=").concat(eventTypes, "&personality=").concat(personality, "&from=").concat(startRequest, "&to=").concat(endRequest)).done(function (response) {
                    _this3.rows = response.data;
                    _this3.currentDate = new Date(response.currentDate);
                    if (response.pagerFrom) {
                      _this3.calendarStartDate = new Date(response.pagerFrom);
                      _this3.calendarEndDate = new Date(response.pagerTo);
                    } else {
                      var date = new Date();
                      var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                      var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                      if (_this3.viewType === 'daily') {
                        firstDay = new Date(date.getTime() - _this3.daySeconds);
                        lastDay = date;
                      } else if (_this3.viewType === 'weekly') {
                        var curDay = date.getDate() + (1 - date.getDay());
                        var curMon = new Date(date.getFullYear(), date.getMonth(), curDay).getTime();
                        firstDay = new Date(curMon - _this3.daySeconds * 7);
                        lastDay = new Date(date.setDate(date.getDate() - date.getDay() + 7));
                      }
                      _this3.calendarStartDate = firstDay;
                      _this3.calendarEndDate = lastDay;
                    }
                    _this3.noFutureEvents = response.noFutureEvents;
                    _this3.dates = _this3.fillDates(_this3.viewType);
                    if (new Date(_this3.$scrollWrapper.attr('data-start')).getTime() >= new Date(response.pagerFrom).getTime()) {
                      $('.agenda-prev', _this3.$main).hide();
                    } else {
                      $('.agenda-prev', _this3.$main).show();
                    }
                    if (new Date(_this3.$scrollWrapper.attr('data-end')).getTime() <= new Date(response.pagerTo).getTime()) {
                      $('.agenda-next', _this3.$main).hide();
                    } else {
                      $('.agenda-next', _this3.$main).show();
                    }
                    _this3.render();
                    setTimeout(function () {
                      _this3.$scrollWrapper.data('plugin_tinyscrollbar').update();
                    }, 1000);
                  }).fail(function (error) {
                    throw new Error(error);
                  }).always(function () {
                    setTimeout(function () {
                      $(e.target).closest('.js-agenda').removeClass('loading');
                    }, 1100);
                  });
                  return false;
                });
              });
            }

            // Bind events for popup switcher.
          }, {
            key: "bindPopupSwitcher",
            value: function bindPopupSwitcher() {
              var _this4 = this;
              var $popupSwitcher = $('.event__popup__switcher', this.$main);
              $popupSwitcher.click(function (e) {
                var $target = $(e.target);
                var $parent = $target.closest('.event__cell');
                e.preventDefault();
                $('.event__cell', _this4.$main).not($parent).removeClass('active');
                $parent.toggleClass('active');
              });
            }

            // Render accessible version.
          }, {
            key: "renderAccessible",
            value: function renderAccessible() {
              this.generateAccessibleContent();
            }

            // Set height for viewport element.
          }, {
            key: "setViewportHeight",
            value: function setViewportHeight() {
              var headerHeight = 0;
              if (this.$header.css('display') !== 'none') {
                headerHeight = this.$header.outerHeight(true);
              }
              this.$viewport.height(headerHeight + this.$content.outerHeight(true));
            }

            // Fill dates for needed period.
          }, {
            key: "fillDates",
            value: function fillDates(type) {
              var startCalendar = this.calendarStartDate.getTime();
              var endCalendar = this.calendarEndDate.getTime();
              var dates = [];
              switch (type) {
                case 'daily':
                  {
                    for (var i = startCalendar; i <= endCalendar; i += this.daySeconds) {
                      var date = new Date(i);
                      for (var j = 0; j <= 23; j += 1) {
                        dates.push({
                          obj: date,
                          year: date.getFullYear(),
                          month: date.getMonth(),
                          day: date.getDate(),
                          hour: j
                        });
                      }
                    }
                    break;
                  }
                case 'weekly':
                  {
                    for (var _i = startCalendar; _i <= endCalendar; _i += this.daySeconds) {
                      var _date = new Date(_i);
                      dates.push({
                        obj: _date,
                        year: _date.getFullYear(),
                        month: _date.getMonth(),
                        day: _date.getDate()
                      });
                    }
                    break;
                  }
                default:
                  {
                    for (var _i2 = startCalendar; _i2 <= endCalendar; _i2 += this.daySeconds) {
                      var _date2 = new Date(_i2);
                      dates.push({
                        obj: _date2,
                        year: _date2.getFullYear(),
                        month: _date2.getMonth(),
                        day: _date2.getDate()
                      });
                    }
                  }
              }
              this.cachedDates[type] = dates;
              return dates;
            }

            // Get amount of dates in month.
          }, {
            key: "setViewType",
            value:
            // Set view type.
            function setViewType(type) {
              var newType = this.viewTypes[type] ? type : 'monthly';
              this.viewType = newType;
              this.$this.attr('data-view-type', newType);
            }

            // Generate header for month view.
          }, {
            key: "generateMonthHeader",
            value: function generateMonthHeader() {
              var temporaryMonthIndex = 100;
              var $temporaryMonth = $();
              var $headerMonth = $('<div class="agenda__header__month"></div>');
              var currentYear = this.currentDate.getFullYear();
              var currentMonth = this.currentDate.getMonth();
              var currentDay = this.currentDate.getDate();
              for (var i = 0; i < this.dates.length; i += 1) {
                var date = this.dates[i];
                var current = currentYear === date.year && currentMonth === date.month && currentDay === date.day;
                var daysInMonth = new Date(date.year, date.month + 1, 0).getDate();
                if (temporaryMonthIndex !== date.month) {
                  $temporaryMonth = $headerMonth.clone().appendTo(this.$header);
                  $temporaryMonth.append("<div class=\"agenda__month__name\">".concat(new Date(date.year, date.month).toLocaleString(this.lang, {
                    month: 'long'
                  }), "</div>"));
                  temporaryMonthIndex = date.month;
                }
                var dateText = "".concat(date.year, "-").concat(date.month + 1, "-").concat(date.day);
                $temporaryMonth.append("<div class=\"agenda__day agenda__day-".concat(daysInMonth).concat(current ? ' today' : '', "\" data-date=\"").concat(dateText, "\">").concat(date.day, "</div>"));
              }
            }

            // Generate header for week view.
          }, {
            key: "generateWeekHeader",
            value: function generateWeekHeader() {
              var currentDay = this.currentDate;
              for (var i = 0; i < this.dates.length; i += 1) {
                var today = currentDay.getDate() === this.dates[i].day && currentDay.getMonth() === this.dates[i].month && currentDay.getFullYear() === this.dates[i].year;
                var name = '';
                if (this.dates[i].obj !== undefined) {
                  name = "".concat(this.dates[i].obj.toLocaleDateString(this.lang, {
                    weekday: 'long'
                  }), " ").concat(this.dates[i].day);
                }
                var dateText = "".concat(this.dates[i].year, "-").concat(this.dates[i].month + 1, "-").concat(this.dates[i].day);
                this.$header.append("<div class=\"agenda__day".concat(today ? ' today' : '', "\" data-date=\"").concat(dateText, "\">").concat(name, "</div>"));
              }
            }

            // Generate header for day view.
          }, {
            key: "generateDayHeader",
            value: function generateDayHeader() {
              var currentDay = this.currentDate.getDate();
              var currentHour = this.currentDate.getHours();
              for (var i = 0; i < this.dates.length; i += 1) {
                var midnight = this.dates[i].hour === 0;
                var today = currentHour === this.dates[i].hour && currentDay === this.dates[i].day;
                var month = new Date(this.dates[i].year, this.dates[i].month).toLocaleString(this.lang, {
                  month: 'long'
                });
                var name = midnight ? "<span>".concat(this.dates[i].day, " ").concat(month, "</span>") : "".concat(this.dates[i].hour, "h");
                var dateText = "".concat(this.dates[i].year, "-").concat(this.dates[i].month + 1, "-").concat(this.dates[i].day);
                this.$header.append("<div class=\"agenda__day".concat(midnight ? ' highlight' : '').concat(today ? ' today' : '', "\" data-date=\"").concat(dateText, "\">").concat(name, "</div>"));
              }
            }

            // Order events before printing.
          }, {
            key: "orderEvents",
            value: function orderEvents(events) {
              var _this5 = this;
              var currentItem = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
              var currentRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
              var ordered = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
              if (events.length) {
                var _ret = function () {
                  var daily = _this5.viewType === 'daily';
                  var eventsArray = ordered.length ? ordered : [_toConsumableArray(events)];
                  var compareEvent = eventsArray[currentRow][currentItem];
                  var startObj = compareEvent.startDate;
                  var startHour = daily && startObj.hour ? startObj.hour : 0;
                  var startDate = new Date(startObj.year, startObj.month - 1, startObj.day, startHour).getTime();
                  var endObj = $.isEmptyObject(compareEvent.endDate) ? false : compareEvent.endDate;
                  var endHour = endObj && daily && endObj.hour ? endObj.hour : 23;
                  var endDate = endObj ? new Date(endObj.year, endObj.month - 1, endObj.day, endHour).getTime() : false;
                  var tempArray = _toConsumableArray(eventsArray);
                  var _loop = function _loop(i) {
                    var event = eventsArray[currentRow][i];
                    var _event$startDate = event.startDate,
                      year = _event$startDate.year,
                      month = _event$startDate.month,
                      day = _event$startDate.day;
                    var eventHour = daily && event.hour ? event.hour : 0;
                    var eventDate = new Date(year, month - 1, day, eventHour).getTime();
                    var eventMargin = _this5.daySeconds * _this5.gapDays;
                    if (eventDate <= startDate + eventMargin || endDate && eventDate <= endDate + eventMargin && eventDate > startDate + eventMargin) {
                      // Copy event to new level of array if it intersects with current date.
                      if (!tempArray[currentRow + 1]) {
                        tempArray.push([]);
                      }
                      tempArray[currentRow + 1].push(event);

                      // Delete this event from current row of array, because it was copied.
                      tempArray[currentRow] = tempArray[currentRow].filter(function (el, idx) {
                        return idx !== tempArray[currentRow].indexOf(event);
                      });
                    }
                  };
                  for (var i = currentItem + 1; i < eventsArray[currentRow].length; i += 1) {
                    _loop(i);
                  }

                  // Check next element in array.
                  if (currentItem < tempArray[currentRow].length - 1) {
                    return {
                      v: _this5.orderEvents(events, currentItem + 1, currentRow, tempArray)
                    };
                  }

                  // Check elements from new line.
                  if (tempArray[currentRow + 1]) {
                    return {
                      v: _this5.orderEvents(events, 0, currentRow + 1, tempArray)
                    };
                  }
                  return {
                    v: tempArray
                  };
                }();
                if (_typeof(_ret) === "object") return _ret.v;
              }
              return [[]];
            }

            // Created all needed cells and fill them with events.
          }, {
            key: "populateCells",
            value: function populateCells(dateRows, color) {
              var $output = [];
              for (var rowIndex = 0; rowIndex < dateRows.length; rowIndex += 1) {
                var events = dateRows[rowIndex];
                var $dayWrapper = $('<div class="agenda__day__wrapper"></div>');
                var content = '';
                var event = '';
                $output.push($dayWrapper);
                for (var i = 0; i < this.dates.length; i += 1) {
                  var date = this.dates[i];
                  var daysInMonth = '';
                  if (this.viewType === 'monthly') {
                    daysInMonth = " agenda__day-".concat(new Date(date.year, date.month + 1, 0).getDate());
                  }
                  event = '';
                  for (var idx = 0; idx < events.length; idx += 1) {
                    event = this.buildEventCell(events[idx], date, i, color);
                    if (event.length) {
                      break;
                    }
                  }
                  content += "<div class=\"agenda__day".concat(daysInMonth, "\">").concat(event, "</div>");
                }
                $dayWrapper.append(content);
              }
              return $output;
            }

            // Building cells with events.
          }, {
            key: "buildEventCell",
            value: function buildEventCell(eventObj, date, dateIndex, color) {
              var event = '';
              var multiplier = 1;
              var _eventObj$startDate = eventObj.startDate,
                year = _eventObj$startDate.year,
                month = _eventObj$startDate.month,
                day = _eventObj$startDate.day;
              var endYearTemp = eventObj.endDate.year;
              var endMonthTemp = eventObj.endDate.month;
              var endDayTemp = eventObj.endDate.day;
              var startDate = new Date(year, month - 1, day).getTime();
              var endDateTemp = new Date(endYearTemp, endMonthTemp - 1, endDayTemp).getTime();
              var endCalendarDate = new Date(this.calendarEndDate).getTime();
              var currentDate = new Date(date.year, date.month, date.day).getTime();
              var className = dateIndex === 0 && currentDate > startDate ? ' event-past' : '';
              var classFutureName = endCalendarDate < endDateTemp ? ' event-future' : '';

              // I know that it is not good code Â¯\_(ãƒ„)_/Â¯.
              if (this.viewType === 'daily') {
                var hour = eventObj.startDate.hour ? eventObj.startDate.hour : 0;
                if (date.year === year && date.month + 1 === month && date.day === day && date.hour === hour || dateIndex === 0 && currentDate > startDate) {
                  // Detect how many days event will take.
                  if (eventObj.endDate.day) {
                    var endDate = eventObj.endDate;
                    var endHour = endDate.hour ? endDate.hour : 23;
                    var endMonth = endDate.month - 1;
                    var endObj = new Date(endDate.year, endMonth, endDate.day, endHour);
                    var diff = endObj - new Date(year, month - 1, day, hour);
                    currentDate = new Date(date.year, date.month, date.day, hour);
                    if (dateIndex === 0 && currentDate > startDate) {
                      diff = endObj - currentDate;
                    }
                    var hours = diff / this.hourSeconds;
                    multiplier += hours;
                    multiplier = this.dates.length - dateIndex < multiplier ? this.dates.length - dateIndex : multiplier;
                  }
                  event = "<div style=\"width: ".concat(100 * multiplier, "%;\" class=\"event__cell").concat(className).concat(classFutureName, "\">").concat(Drupal.theme('agendaEventCell', eventObj, color), "</div>");
                }
              } else if (dateIndex === 0 && currentDate > startDate || currentDate === startDate) {
                // Detect how many days event will take.
                if (eventObj.endDate.day) {
                  var _endDate = eventObj.endDate;
                  var endDateObj = new Date(_endDate.year, _endDate.month - 1, _endDate.day);
                  var _diff = endDateObj - new Date(year, month - 1, day);
                  if (dateIndex === 0 && currentDate > startDate) {
                    _diff = endDateObj - currentDate;
                  }
                  var days = _diff / this.daySeconds;
                  multiplier += days;
                  multiplier = this.dates.length - dateIndex < multiplier ? this.dates.length - dateIndex : multiplier;
                }
                event = "<div style=\"width: ".concat(100 * multiplier, "%;\" class=\"event__cell").concat(className).concat(classFutureName, "\">").concat(Drupal.theme('agendaEventCell', eventObj, color), "</div>");
              }
              return event;
            }

            // Generate selector for view type.
          }, {
            key: "generateViewTypeSelector",
            value: function generateViewTypeSelector() {
              var _this6 = this;
              var keys = Object.keys(this.viewTypes);
              var _loop2 = function _loop2(i) {
                var type = keys[i];
                var viewTypes = {
                  monthly: Drupal.t('Month'),
                  weekly: Drupal.t('Week'),
                  daily: Drupal.t('Day')
                };
                var name = viewTypes[keys[i]];
                var $link = $("<a class=\"agenda__view__selector".concat(type === _this6.viewType ? ' active' : '', "\" href=\"#\">").concat(name, "</a>"));
                $link.appendTo(_this6.$viewTypeWrapper);
                $link.click(function (e) {
                  e.preventDefault();
                  _this6.$main = $(e.target).closest('.js-agenda');
                  _this6.$header = $('.agenda__header', _this6.$main);
                  _this6.$content = $('.agenda__content', _this6.$main);
                  _this6.$viewTypeWrapper = $('.agenda__view__wrapper', _this6.$main);
                  _this6.$typeWrapper = $('.agenda__types__wrapper', _this6.$main);
                  _this6.$viewport = $('.viewport', _this6.$main);
                  if (!$(e.target).hasClass('active')) {
                    $('.agenda__view__selector', _this6.$viewTypeWrapper).removeClass('active');
                    $link.addClass('active');
                    _this6.setViewType(type);
                    _this6.dates = _this6.fillDates(type);
                    _this6.getRows();
                    setTimeout(function () {
                      _this6.$scrollWrapper.data('plugin_tinyscrollbar').update();
                    }, 1000);
                  }
                  var top = $(_this6.$main).offset().top - 100;
                  $('html, body').animate({
                    scrollTop: top
                  }, '300');
                });
              };
              for (var i = 0; i < keys.length; i += 1) {
                _loop2(i);
              }
            }

            // Generate main content of calendar.
          }, {
            key: "generateContent",
            value: function generateContent() {
              var _this7 = this;
              var keys = Object.keys(this.rows);
              var _loop3 = function _loop3(i) {
                var type = keys[i];
                var row = _this7.rows[keys[i]];
                var eventsToOrder = [];
                for (var ind = 0; ind < row.events.length; ind += 1) {
                  var startEv = row.events[ind].startDate;
                  var endEv = row.events[ind].endDate;
                  var startEvDate = new Date(startEv.year, startEv.month - 1, startEv.day).getTime();
                  var endEventDate = new Date(endEv.year, endEv.month - 1, endEv.day).getTime();
                  var startDate = _this7.dates[0];
                  var startDateObj = new Date(startDate.year, startDate.month, startDate.day);
                  var currentStart = startDateObj.getTime();
                  var endDate = _this7.dates[_this7.dates.length - 1];
                  var currentEnd = new Date(endDate.year, endDate.month, endDate.day).getTime();
                  if (startEvDate < currentEnd && endEventDate > currentStart) {
                    eventsToOrder.push(row.events[ind]);
                  }
                  if (row.events[ind].subevents !== undefined) {
                    for (var subInd = 0; subInd < row.events[ind].subevents.length; subInd += 1) {
                      startEv = row.events[ind].subevents[subInd].startDate;
                      endEv = row.events[ind].subevents[subInd].endDate;
                      startEvDate = new Date(startEv.year, startEv.month - 1, startEv.day).getTime();
                      endEventDate = new Date(endEv.year, endEv.month - 1, endEv.day).getTime();
                      if (startEvDate < currentEnd && endEventDate > currentStart) {
                        eventsToOrder.push(row.events[ind].subevents[subInd]);
                      }
                    }
                  }
                }
                var $rowWrapper = $("<div style=\"background: ".concat(row.color, ";\" class=\"show agenda__row\"></div>"));
                var orderedEvents = _this7.orderEvents(eventsToOrder);
                _this7.$content.append($rowWrapper);
                $rowWrapper.append(_this7.populateCells(orderedEvents, row.color));

                // Generate controls.
                var $typeSelect = $("<a href=\"#\" style=\"color: ".concat(row.color, "; background: ").concat(row.color, ";\" class=\"btn agenda__type__selector\">").concat(type, "</a>")).appendTo(_this7.$typeWrapper);
                $typeSelect.click(function (e) {
                  e.preventDefault();
                  var $row = $('.agenda__row', _this7.$content);
                  if ($('.agenda__row:not(.show)', _this7.$content).length === 0 && !$('.agenda__type__selector', _this7.$typeWrapper).hasClass('active')) {
                    $row.removeClass('show');
                  }
                  $(e.target).toggleClass('active');
                  $rowWrapper.toggleClass('show', $(e.target).hasClass('active'));
                  if (!$row.hasClass('show')) {
                    $row.addClass('show');
                  }
                  _this7.setViewportHeight();
                });
              };
              for (var i = 0; i < keys.length; i += 1) {
                _loop3(i);
              }
              this.setViewportHeight();
            }

            // Prepare accessible data for printing.
          }, {
            key: "prepareAccessibleData",
            value: function prepareAccessibleData(row) {
              var data = {};
              for (var j = 0; j < row.events.length; j += 1) {
                var $event = row.events[j];
                var startObj = $event.startDate;
                var startDate = new Date(startObj.year, startObj.month - 1, startObj.day);
                var startListObj = this.accessibleDates[0];
                var startList = new Date(startListObj.year, startListObj.month, startListObj.day);
                var endListObj = this.accessibleDates[this.accessibleDates.length - 1];
                var endList = new Date(endListObj.year, endListObj.month, endListObj.day);
                if (startDate.getTime() < startList.getTime()) {
                  this.accessibleDates = [];
                  var daysCount = (endList.getTime() - startDate.getTime()) / this.daySeconds;
                  for (var i = 0; i <= daysCount; i += 1) {
                    var date = new Date(startDate.getTime() + this.daySeconds * i);
                    this.accessibleDates.push({
                      obj: date,
                      year: date.getFullYear(),
                      month: date.getMonth(),
                      day: date.getDate()
                    });
                  }
                }
              }
              for (var _i3 = 0; _i3 < this.accessibleDates.length; _i3 += 1) {
                var _date3 = this.accessibleDates[_i3];
                for (var idx = 0; idx < row.events.length; idx += 1) {
                  var event = row.events[idx];
                  if (event.startDate.month === _date3.month && event.startDate.day === _date3.day) {
                    if (!data[_date3.day]) {
                      data[_date3.day] = {};
                      data[_date3.day].events = [];
                      data[_date3.day].date = _date3.obj;
                    }
                    data[_date3.day].events.push(event);
                  }
                  if (row.events[idx].subevents !== undefined) {
                    for (var subIdx = 0; subIdx < row.events[idx].subevents.length; subIdx += 1) {
                      var subevent = row.events[idx].subevents[subIdx];
                      if (subevent.startDate.month === _date3.month && subevent.startDate.day === _date3.day) {
                        if (!data[_date3.day]) {
                          data[_date3.day] = {};
                          data[_date3.day].events = [];
                          data[_date3.day].date = _date3.obj;
                        }
                        data[_date3.day].events.push(row.events[idx].subevents[subIdx]);
                      }
                    }
                  }
                }
              }
              return data;
            }

            // Generate main content for accessible version.
          }, {
            key: "generateAccessibleContent",
            value: function generateAccessibleContent() {
              var _this8 = this;
              var keys = Object.keys(this.accessibleRows);
              var firstDay = this.accessibleDates[0].obj;
              var lastDay = this.accessibleDates[this.accessibleDates.length - 1].obj;
              var noEvents = Drupal.t('No events');
              var noEventsFlag = true;
              var text = Drupal.t('Week from !from to !to', {
                '!from': firstDay.toLocaleString(this.lang, {
                  month: 'long',
                  day: 'numeric'
                }),
                '!to': lastDay.toLocaleString(this.lang, {
                  month: 'long',
                  day: 'numeric'
                })
              });
              this.$accessibleEvents.before("<div class=\"agenda__events__title\">".concat(text, "</div>"));
              for (var i = 0; i < keys.length; i += 1) {
                var type = keys[i];
                var row = this.accessibleRows[keys[i]];
                if (row.events.length) {
                  (function () {
                    var $eventList = $(Drupal.theme('agendaAccessibleEventList', _this8.prepareAccessibleData(row), type, _this8.lang));
                    _this8.$accessibleEvents.append($eventList);
                    noEventsFlag = false;

                    // Generate controls.
                    var $typeSelect = $("<a href=\"#\" class=\"btn agenda__type__selector\">".concat(type, "</a>")).appendTo(_this8.$accessibleTypeWrapper);
                    $typeSelect.click(function (e) {
                      e.preventDefault();
                      $('.agenda__event__list', _this8.$accessibleEvents).hide();
                      $('.agenda__type__selector', _this8.$accessibleTypeWrapper).removeClass('active');
                      $eventList.show();
                      $(e.target).addClass('active');
                    });
                  })();
                }
              }
              if (noEventsFlag) {
                this.$accessibleEvents.append("<div class=\"event__title\">".concat(noEvents, "</div>"));
              }
              if ($('.agenda__day__event[data-date]', this.$accessibleEvents).length) {
                var oldFirstDate = firstDay.toLocaleString('default', {
                  month: 'long',
                  day: 'numeric'
                });
                var newFirstDate = $('.agenda__day__event[data-date]', this.$accessibleEvents).attr('data-date');
                var newDateFull = new Date("".concat(new Date().getUTCFullYear(), " ").concat(newFirstDate));
                if (oldFirstDate !== newFirstDate && newDateFull.getTime() < firstDay.getTime()) {
                  var newTitle = Drupal.t('Week from !from to !to', {
                    '!from': newFirstDate,
                    '!to': lastDay.toLocaleString(this.lang, {
                      month: 'long',
                      day: 'numeric'
                    })
                  });
                  $('.agenda__events__title', this.$main).text(newTitle);
                }
              }
              $('.agenda__type__selector', this.$accessibleTypeWrapper).first().addClass('active');
            }
          }], [{
            key: "getDaysInMonth",
            value: function getDaysInMonth(month, year) {
              return new Date(year, month + 1, 0).getDate();
            }
          }]);
          return Agenda;
        }();
        var agenda = new Agenda($(element));
        agenda.getRows();
        agenda.getAccessibleRows();
      });
    }
  };

  /**
   * Theme for agenda block with main structure.
   */
  Drupal.theme.agendaMainStructure = function () {
    var output = '';
    output += '<div class="custom-scrollbar-wrapper">';
    output += '<div class="viewport">';
    output += '<div class="agenda__main__wrapper overview">';
    output += '<div class="agenda__header"></div>';
    output += '<div class="agenda__content"></div>';
    output += '</div>';
    output += '</div>';
    output += '<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>';
    output += '<div class="agenda__buttons">';
    output += '<button class="agenda-prev"></button>';
    output += '<button class="agenda-next"></button>';
    output += '</div>';
    output += '</div>';
    output += '<div class="agenda__controls">';
    output += '<div class="agenda__view__wrapper"></div>';
    output += '<div class="agenda__types__wrapper"></div>';
    output += '</div>';
    output += '<div class="agenda--accessible">';
    output += '<div class="agenda__types__wrapper--accessible"></div>';
    output += '<div class="agenda__events"></div>';
    output += '</div>';
    return output;
  };

  /**
   * Theme for event cell.
   */
  Drupal.theme.agendaEventCell = function (event, color) {
    var output = '';
    output += "<div class=\"event__title\">".concat(event.name, "</div>");
    output += '<div class="event__content">';
    if (event.detailPage) {
      output += event.detailPage;
    } else if (event.longTitle || event.shortDescription) {
      output += "<a style=\"color: ".concat(color, "\" class=\"event__popup__switcher\" href=\"#\"></a>");
      output += '<div class="event__popup">';
      output += "<div class=\"event__popup__title\">".concat(event.longTitle, "</div>");
      if (event.shortDescription !== null) {
        output += "<div class=\"event__popup__description\">".concat(event.shortDescription, "</div>");
      }
      output += '</div>';
    }
    output += '</div>';
    return output;
  };

  /**
   * Theme for accessible event list.
   */
  Drupal.theme.agendaAccessibleEventList = function (days, type, lang) {
    var output = '';
    var keys = Object.keys(days);
    output += '<div class="agenda__event__list">';
    for (var i = 0; i < keys.length; i += 1) {
      var day = days[keys[i]];
      output += '<div class="agenda__day--accessible">';
      output += "<div class=\"agenda__day__title\">".concat(day.date.toLocaleString(lang, {
        weekday: 'long',
        day: 'numeric'
      }), "</div>");
      for (var idx = 0; idx < day.events.length; idx += 1) {
        var event = day.events[idx];
        var _event$startDate2 = event.startDate,
          hour = _event$startDate2.hour,
          minutes = _event$startDate2.minutes;
        var eventStart = event.startDate;
        var startObj = new Date(eventStart.year, eventStart.month - 1, eventStart.day);
        var stringDate = idx === 0 ? startObj.toLocaleString('default', {
          month: 'long',
          day: 'numeric'
        }) : '';
        hour = hour && hour < 10 ? "0".concat(hour) : hour;
        minutes = minutes && minutes < 10 ? "0".concat(minutes) : '00';
        output += "<div class=\"agenda__day__event\" data-date=\"".concat(stringDate, "\">");
        output += "<div class=\"event__time\">".concat(hour ? "".concat(hour, "h").concat(minutes) : '', "</div>");
        output += '<div class="event__content">';
        output += "<div class=\"event__title\">".concat(event.name, "</div>");
        if (event.shortDescription !== null) {
          output += "<div class=\"event__description\">".concat(event.shortDescription, "</div>");
        }
        output += '</div>';
        output += '</div>';
      }
      output += '</div>';
    }
    output += '</div>';
    return output;
  };
})(jQuery, Drupal, drupalSettings);
"use strict";

(function ($, Drupal) {
  /**
   * Create kiosque tabs.
   */
  Drupal.behaviors.agendaSummary = {
    attach: function attach(context) {
      $('.agenda-summary', context).once('agendaSummary').each(function (index, element) {
        $(element).find('.agenda-summary-list li a').each(function (index, item) {
          $(item).click(function () {
            // check if it is not builder mode
            if (!$(element).hasClass('layout-builder-block')) {
              $(document).ajaxComplete(function () {
                var wW = $(window).width();
                if ($('.ui-dialog').find('.agenda-list-wrapper')) {
                  var getSizes = function getSizes(val) {
                    var $viewportHeight = $(window).height();
                    var $paddingTop = $popup.css('paddingTop');
                    var $paddingBottom = $popup.css('paddingBottom');
                    var $titleHeight = $popup.find('.ui-dialog-title').outerHeight();
                    var $listHeight = $popup.find('.agenda-list-wrapper').outerHeight();
                    var $differnt = $viewportHeight - $titleHeight - parseInt($paddingTop) - parseInt($paddingBottom) - val * 2;
                    if ($listHeight > $differnt) {
                      var setScroll = function setScroll() {
                        scrollWrapper.css('height', $differnt + 'px');
                        scrollWrapper.overlayScrollbars({});
                      };
                      var isWrapper = $container.find('.agenda-summary-scrollbar-wrapper');
                      var scrollWrapper;

                      // check if scroll in not in the popup
                      if (isWrapper.length === 0) {
                        $container.wrapInner('<div class="agenda-summary-scrollbar-wrapper"></div>');
                        scrollWrapper = $container.find('.agenda-summary-scrollbar-wrapper');
                        setScroll();
                      } else if (isWrapper.length === 1) {
                        scrollWrapper = $container.find('.agenda-summary-scrollbar-wrapper');
                        setScroll();
                      }
                    }
                  };
                  $('.ui-dialog').addClass('agenda-summary-popup');
                  $('.ui-widget-overlay').addClass('agenda-summary-popup--overlay');
                  if (wW < 768) {
                    $('html').addClass('agenda-no-scroll');
                  }
                  var $popup = $('.agenda-summary-popup');
                  var $titleAgenda = $popup.find('h2');
                  var $titlePopup = $popup.find('.ui-dialog-title');
                  $titlePopup.empty().append($titleAgenda);
                  var $container = $(".ui-dialog .ui-dialog-content");
                  $container.css('overflow', 'inherit');
                  getSizes(0);
                  setTimeout(function () {
                    if ($popup.length) {
                      var $postop = $popup.position().top;
                      getSizes($postop);
                    }
                  }, 500);
                  $(window).resize(function () {
                    if ($popup.length) {
                      var $postopResize = $popup.position().top;
                      getSizes($postopResize);
                    }
                  });
                }
              });
            }
            // end of checking if it is not builder mode
          });
        });

        $(document).ajaxComplete(function () {
          $('.ui-dialog-titlebar-close').click(function () {
            $('html').removeClass('agenda-no-scroll');
          });
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
/* eslint-disable no-use-before-define */
(function ($, Drupal) {
  /**
   * blockÐ¡ookie
   */
  Drupal.behaviors.blockÐ¡ookie = {
    attach: function attach(context) {
      $('body', context).once('blockÐ¡ookie').each(function (index, element) {
        var addConfirmbtn = function addConfirmbtn() {
          function createBtn() {
            var banner = element.querySelector('#tarteaucitronRoot');
            if (banner) {
              var closeBtn = banner.querySelector('#tarteaucitronClosePanel');
              var popup = banner.querySelector('#tarteaucitronServices');
              var confirmBtn = document.createElement('button');
              confirmBtn.classList.add('cookies-confirmBtn');
              confirmBtn.textContent = Drupal.t('Confirm my choices');
              popup.append(confirmBtn);
              var closePopupEmulator = document.createElement('button');
              closePopupEmulator.classList.add('cookies-closeBtnEmulator');
              closePopupEmulator.textContent = Drupal.t('Close');
              popup.insertAdjacentElement("beforeBegin", closePopupEmulator);
              var videoResponsive = document.querySelectorAll('.video-embed-field-responsive-video .tac_activate');
              if (videoResponsive.length > 0) {
                var _iterator = _createForOfIteratorHelper(videoResponsive),
                  _step;
                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    var container = _step.value;
                    var par = container.closest('.youtube_playlist_custom_wrapper');
                    if (par) {
                      par.removeAttribute('style');
                    }
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
              }
              confirmBtn.addEventListener('click', function (e) {
                e.preventDefault();
                closeBtn.click();
              });
              var hideCookiePopup = function hideCookiePopup() {
                if (document.getElementsByTagName('body')[0].classList !== undefined) {
                  document.getElementsByTagName('body')[0].classList.remove('tarteaucitron-modal-open');
                  document.querySelector('#tarteaucitronBack').style.display = 'none';
                  document.querySelector('#tarteaucitron').style.display = 'none';
                }
              };
              closePopupEmulator.addEventListener('click', function (e) {
                e.preventDefault();
                hideCookiePopup();
              });
              clearInterval(myBtnInterval);
            }
          }
          var myBtnInterval = setInterval(createBtn, 1000);
        };
        addConfirmbtn();
        var changeText = function changeText() {
          function moveTitle() {
            var banner = element.querySelector('#tarteaucitronRoot');
            if (banner) {
              var lines = banner.querySelectorAll('li.tarteaucitronLine');
              if (lines.length > 0) {
                var _iterator2 = _createForOfIteratorHelper(lines),
                  _step2;
                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    var item = _step2.value;
                    var title = item.querySelector('.tarteaucitronH3');
                    var buttonsContainer = item.querySelector('.tarteaucitronAsk');
                    if (title) {
                      buttonsContainer.prepend(title);
                    }
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }
              }
              clearInterval(myInterval);
            }
          }
          var myInterval = setInterval(moveTitle, 1000);
        };
        function WidthChange(mq) {
          if (mq.matches) {
            changeText();
          }
        }
        var media = '(max-width: 767px)';
        var mq = window.matchMedia(media);
        mq.addListener(WidthChange);
        WidthChange(mq);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create kiosque tabs.
   */
  Drupal.behaviors.kiosqueTabs = {
    attach: function attach(context) {
      $('.js-block-kiosque', context).once('kiosqueTabs').each(function (index, element) {
        var tabs = element;
        var tabButton = $('[aria-controls]', tabs);
        tabButton.click(function (e) {
          var target = e.target;
          var targetButton = $(target).is('button') ? $(target)[0] : $(target).parents('button')[0];
          var isExpanded = targetButton.getAttribute('aria-selected') === true;
          var active = tabs.querySelector('[aria-selected="true"]');
          if (active && active !== targetButton) {
            // Set the expanded state on the triggering element
            active.setAttribute('aria-selected', 'false');
            // Hide the accordion sections, using aria-controls to specify the desired section
            document.getElementById(active.getAttribute('aria-controls')).setAttribute('hidden', '');
          }
          if (!isExpanded) {
            // Set the expanded state on the triggering element
            targetButton.setAttribute('aria-selected', 'true');
            // Hide the accordion sections, using aria-controls to specify the desired section
            document.getElementById(targetButton.getAttribute('aria-controls')).removeAttribute('hidden');
          }
        });
        tabButton.keydown(function (e) {
          var code = e.keyCode || e.which;
          if (code === 13 || code === 32) {
            $(e.target).click();
          }
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create kiosque tabs.
   */
  Drupal.behaviors.boContent = {
    attach: function attach(context) {
      $('.bo_content_wrapper', context).once('boContent').each(function (index, element) {
        var $isnextEl = $(element).closest('.one__column__header').next('.one__column__main').find('.container').children();
        var $isnextElLength = $isnextEl.length;
        if (!$isnextElLength) {
          $(element).closest('.one__column__header').next('.one__column__main').hide();
        }
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create service slider.
   */
  Drupal.behaviors.edugouvThematicSliderNewBehavior = {
    attach: function attach(context) {
      $('.js-slick--thematic-slider-new', context).once('edugouvThematicSliderNewBehavior').each(function (index, element) {
        var $sliderHorizontal = $(element);
        var showedSlides = 3;
        var isEditor = $(element).closest('.ckeditor-text');
        if (isEditor.closest('.basic_page--full').length) {
          showedSlides = 3;
        } else if ($(element).closest('.ckeditor-text').length) {
          showedSlides = 2;
        }
        $sliderHorizontal.slick({
          infinite: true,
          slidesToShow: showedSlides,
          slidesToScroll: 1,
          dots: true,
          centerMode: true,
          centerPadding: '60px',
          responsive: [{
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              centerPadding: '0px',
              centerMode: false
            }
          }]
        });
        var $nextSlide = $sliderHorizontal.find('.slick-next');
        var $prevSlide = $sliderHorizontal.find('.slick-prev');
        var $translatableAriaNext = Drupal.t('Next slide');
        var $translatableAriaPrev = Drupal.t('Previous slide');
        $nextSlide.attr('aria-label', $translatableAriaNext);
        $prevSlide.attr('aria-label', $translatableAriaPrev);
        var randId = Math.floor(Math.random() * 1000);
        var $sliderContainer = element.closest('.thematic-page-slider');
        $($sliderContainer).find('h2').attr('id', "title-thematic-page-slider".concat(randId));
        $($sliderContainer).find('.slick-dots').attr('aria-labelledby', "title-thematic-page-slider".concat(randId));
        $($sliderContainer).find('.js-slick--thematic-slider').attr('aria-labelledby', "title-thematic-page-slider".concat(randId));
        var $slideTitles = $sliderContainer.querySelectorAll('.thematic-page-slide:not(.slick-cloned) h3');
        var $slickDots = $sliderContainer.querySelectorAll('.slick-dots li');
        $sliderHorizontal.on('afterChange', function () {
          setTimeout(function () {
            // $('.slick-slide').removeAttr('aria-describedby');
            $sliderHorizontal.find('.slick-dots li button').attr('tabindex', '0');
          }, 1);
        });
        $slideTitles.forEach(function (item, i) {
          $(item).attr('id', "slide-thematic-title".concat(i + 1).concat(index));
          // $(item).closest('.thematic-page-slide').removeAttr('aria-describedby');
        });

        $slickDots.forEach(function (item, i) {
          $(item).attr('aria-labelledby', "slide-thematic-title".concat(i + 1).concat(index));
          $(item).find('button').attr('aria-label', "".concat(i + 1, " ").concat(Drupal.t('sur'), " ").concat($slickDots.length));
        });
        function moveList() {
          var list = $sliderHorizontal.find('.slick-list');
          $sliderHorizontal.append(list);
        }
        var $slides = $sliderContainer.querySelectorAll('.thematic-page-slide');
        $slides.forEach(function (item) {
          var idAttribute = item.getAttribute('id');
          if (idAttribute && idAttribute != '') {
            var trimedIdtext = idAttribute.trim();
            item.setAttribute('id', trimedIdtext);
          } else {
            item.removeAttribute('id');
          }
        });
        setTimeout(function () {
          $nextSlide.html(Drupal.t('Next'));
          $prevSlide.html(Drupal.t('Previous'));
        });
        function checkDotsAndSlides() {
          var slides = $sliderContainer.querySelectorAll('.thematic-page-slide:not(.slick-cloned)');
          if ($slickDots.length < slides.length) {
            $sliderContainer.querySelector('.slick-dots').classList.add('hide-dots');
            slides.forEach(function (slide) {
              slide.removeAttribute('aria-describedby');
            });
          } else {
            $sliderContainer.querySelector('.slick-dots').classList.remove('hide-dots');
          }
        }
        checkDotsAndSlides();
        setTimeout(moveList(), 0);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create bulletin tabs.
   */
  Drupal.behaviors.bulletinTabs = {
    attach: function attach(context) {
      $('.js-current-bulletin', context).once('bulletinTabs').each(function (index, element) {
        var tabs = element;
        var tabButton = $('[aria-controls]', tabs);
        tabButton.attr('aria-selected', false);
        tabButton.eq(0).attr('aria-selected', true);
        function makeButtonsActive(tab) {
          tab.find('a').attr('tabindex', '0');
        }
        function makeButtonsInactive(tab) {
          tab.find('a').attr('tabindex', '-1');
        }
        tabButton.each(function () {
          makeButtonsInactive($(this));
        });
        makeButtonsActive(tabButton.eq(0));
        tabButton.click(function (e) {
          var target = e.target;
          var targetButton = $(target).is('.current-bulletin-pages__header__button') ? $(target)[0] : $(target).parents('.current-bulletin-pages__header__button')[0];
          var isExpanded = targetButton.getAttribute('aria-selected') === true;
          var active = tabs.querySelector('[aria-selected="true"]');
          tabButton.each(function () {
            makeButtonsInactive($(this));
          });
          makeButtonsActive($(target));
          if (active && active !== targetButton) {
            // Set the expanded state on the triggering element
            active.setAttribute('aria-selected', 'false');
            // Hide the accordion sections, using aria-controls to specify the desired section
            var elementId = "#".concat(active.getAttribute('aria-controls'));
            if ($(elementId).length) {
              $(elementId).attr('hidden', '');
            }
          }
          if (!isExpanded) {
            // Set the expanded state on the triggering element
            targetButton.setAttribute('aria-selected', 'true');
            // Hide the accordion sections, using aria-controls to specify the desired section
            var _elementId = "#".concat(targetButton.getAttribute('aria-controls'));
            if ($(_elementId).length) {
              $(_elementId).removeAttr('hidden');
            }
          }
        });
        tabButton.keydown(function (e) {
          var code = e.keyCode || e.which;
          if (code === 13 || code === 32) {
            $(e.target).click();
          }
        });

        // Mobile behavior.
        var downloadButtonClone = function downloadButtonClone(mq) {
          if (mq.matches) {
            tabButton.each(function (i, el) {
              var downloadButton = $(el).find('.download-wrapper');
              var shareButton = $(el).find('.js-share');
              var tabElement = $("#".concat(el.getAttribute('aria-controls')));
              downloadButton.once().clone().appendTo(tabElement);
              shareButton.once().clone().appendTo(tabElement);
              if ($('.current-bulletin-pages__tabs .js-share').length > 0) {
                var share = tabElement.find('.js-share');
                var download = tabElement.find('.download-wrapper');
                var wrappedItems = share.add(download);
                wrappedItems.wrapAll('<div class="wrapped-share-download"></div>');
              }
            });
          } else {
            tabButton.each(function (i, el) {
              var tabElement = $("#".concat(el.getAttribute('aria-controls')));
              var share = tabElement.find('.js-share');
              var download = tabElement.find('.download-wrapper');
              var wrappedItems = share.add(download);
              wrappedItems.unwrap();
            });
          }
        };
        var mq = window.matchMedia('(max-width: 767px)');
        mq.addListener(downloadButtonClone);
        downloadButtonClone(mq);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
(function ($, Drupal) {
  function simplifyText() {
    var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var smplStr = str.toLowerCase().replace(/^\s+|\s+$/g, ''); // trim

    var from = 'Ã£Ã Ã¡Ã¤Ã¢áº½Ã¨Ã©Ã«ÃªÃ¬Ã­Ã¯Ã®ÃµÃ²Ã³Ã¶Ã´Ã¹ÃºÃ¼Ã»Ã±Ã§Â·/_,:;';
    var to = 'aaaaaeeeeeiiiiooooouuuunc------';
    for (var i = 0; i < from.length; i += 1) {
      smplStr = smplStr.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    smplStr = smplStr.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

    return smplStr;
  }
  var SearchItem = /*#__PURE__*/function () {
    function SearchItem($el) {
      _classCallCheck(this, SearchItem);
      this.$el = $el; // heading DOM element
      var $body = $el.nextElementSibling;
      this.title = $el.innerText.trim();
      this.titleSmpl = simplifyText($el.innerText.trim());
      this.bodySmpl = simplifyText($body.innerText.trim());
      this.anchor = $el.id;
    }
    _createClass(SearchItem, [{
      key: "search",
      value: function search(text) {
        var _this = this;
        if (!text) {
          return {
            title: 0,
            body: 0
          };
        }
        var searchWords = text.split('-');
        var counter = 0;
        searchWords.forEach(function (word) {
          if (_this.titleSmpl.indexOf(word) >= 0) {
            counter += 10;
          }
          if (_this.bodySmpl.indexOf(word) >= 0) {
            counter += 1;
          }
        });
        return counter;
      }
    }]);
    return SearchItem;
  }();
  var SearchItems = /*#__PURE__*/function () {
    function SearchItems() {
      _classCallCheck(this, SearchItems);
      this.items = [];
    }
    _createClass(SearchItems, [{
      key: "add",
      value: function add(searchItem) {
        this.items.push(searchItem);
      }
    }, {
      key: "search",
      value: function search(text) {
        var results = [];
        if (!text || !text.trim().length) {
          return results;
        }
        var textSmpl = simplifyText(text.trim());
        this.items.forEach(function (item) {
          var value = item.search(textSmpl);
          if (value > 0) {
            results.push({
              $el: item.$el,
              title: item.title,
              value: value
            });
          }
        });
        results.sort(function (a, b) {
          return a.value > b.value ? -1 : 1;
        });
        return results;
      }
    }]);
    return SearchItems;
  }();
  Drupal.behaviors.faqSearch = {
    attach: function attach(context) {
      $('.faq-search', context).once('faqSearch').each(function (index, $element) {
        var $textField = $element.querySelector('.faq-search__field');
        var $resultsList = $element.querySelector('.faq-search__results');
        var $btnShowAllResults = $element.querySelector('.faq-search__btn--all-results');
        var $btnShowRelevantResults = $element.querySelector('.faq-search__btn--relevant-results');
        var $faqHeadings = document.querySelectorAll('.faq-section__accordion .faqfield-question');
        var searchItems = new SearchItems();
        $faqHeadings.forEach(function ($faqHeading) {
          var searchItem = new SearchItem($faqHeading);
          searchItems.add(searchItem);
        });
        function currentGapHeight() {
          var topAdminToolbar = document.querySelector('#toolbar-bar');
          var botAdminToolbar = document.querySelector('.toolbar-tray-horizontal.is-active');
          var crisisMessage = document.querySelector('.back-office-message-tab');
          var miniSiteMenu = document.querySelector('.mini-site-menu-wrapper');
          var summaryBlock = document.querySelector('.js-edugouv-progress-bar');
          var sumBlockHeight = 0;
          if ($(window).width() >= 768) {
            sumBlockHeight = 0;
          } else {
            sumBlockHeight = summaryBlock ? summaryBlock.offsetHeight : 0;
          }
          var topAdminToolbarHeight = topAdminToolbar ? topAdminToolbar.offsetHeight : 0;
          var botAdminToolbarHeight = botAdminToolbar ? botAdminToolbar.offsetHeight : 0;
          var crisisMessageHeight = crisisMessage ? crisisMessage.offsetHeight : 0;
          var miniSiteMenuHeight = miniSiteMenu ? miniSiteMenu.offsetHeight : 0;
          return topAdminToolbarHeight + botAdminToolbarHeight + crisisMessageHeight + miniSiteMenuHeight + sumBlockHeight + $('.header').outerHeight();
        }
        function onItemClick(e) {
          if (!e.target.classList.contains('faq-search__result-link')) {
            return;
          }
          e.preventDefault();
          var $el = $("#".concat(e.target.getAttribute('data-id')));
          var $expandedAccordions = $('.ui-accordion .ui-accordion-header-active').not($el);
          $expandedAccordions.trigger('click', [true]); // close expanded accordions;

          setTimeout(function () {
            $('html, body').animate({
              scrollTop: $el.offset().top - currentGapHeight()
            }, 500);

            // expand active accordion
            if ($el.hasClass('ui-accordion-header-collapsed')) {
              $el.click();
            }
          }, 250);
        }
        function onShowAllClick(e) {
          e.preventDefault();
          $element.classList.add('faq-search--all-results');
        }
        function onShowRelevantClick(e) {
          e.preventDefault();
          $element.classList.remove('faq-search--all-results');
        }
        function renderSearchResults(results, text) {
          $element.classList.remove('faq-search--no-results');
          $element.classList.remove('faq-search--has-more-5-results');
          if (results && results.length) {
            $element.classList.add('faq-search--has-results');
          } else {
            if (text) {
              $element.classList.add('faq-search--no-results');
            }
            $element.classList.remove('faq-search--has-results');
          }
          if (results && results.length > 5) {
            $element.classList.add('faq-search--has-more-5-results');
          }
          var itemsHtml = '';
          results.forEach(function (result) {
            itemsHtml += "\n              <li class=\"faq-search__result\">\n              <a class=\"faq-search__result-link\" data-id=\"".concat(result.$el.id, "\" href=\"#").concat(result.$el.id, "\">- ").concat(result.title, "</a>\n              </li>");
          });
          $resultsList.innerHTML = itemsHtml;
        }

        // Add event listeners:
        $resultsList.addEventListener('click', onItemClick);
        $btnShowAllResults.addEventListener('click', onShowAllClick);
        $btnShowRelevantResults.addEventListener('click', onShowRelevantClick);
        var timerId;
        $textField.addEventListener('keyup', function (e) {
          clearTimeout(timerId);
          timerId = setTimeout(function () {
            var results = searchItems.search(e.target.value);
            renderSearchResults(results, e.target.value);
          }, 150);
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  Drupal.behaviors.faqSection = {
    attach: function attach(context) {
      $('.faq-section', context).once('faqSection').each(function (index, $element) {
        function onHeadingClick(e, isFakeClick) {
          if (!isFakeClick) {
            var $expandedAccordions = $('.ui-accordion .ui-accordion-header-active').not(e.target);
            $expandedAccordions.trigger('click', [true]); // close expanded accordions;
          }
        }

        $($element).on('click.faqSection', '.ui-accordion-header', onHeadingClick);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create image gallery.
   */
  Drupal.behaviors.edugouvGallery = {
    attach: function attach(context) {
      $('.js-gallery', context).once('edugouvGallery').each(function (index, element) {
        var $this = $(element);
        var $images = $('img', $this);
        if ($images.length) {
          $images.each(function (i, image) {
            console.log(image.src);
            $(image).wrap("<div class=\"gallery-slider\"></div>");
            $("<img class=\"call-popup-modal\" src='".concat(image.src, "' />")).insertAfter($(image));
            $(image).next('.call-popup-modal').click(function (event) {
              event.stopPropagation();
              $(image).trigger("click");
            });
          });
        }
        var slidesToShow = $this.closest('.ckeditor-text').length ? 1 : 2;
        $this.slick({
          arrows: true,
          prevArrow: '<button type="button" class="slick-prev">PrÃ©cÃ©dent</button>',
          nextArrow: '<button type="button" class="slick-next">Suivant</button>',
          infinite: true,
          dots: false,
          centerMode: true,
          slidesToShow: slidesToShow,
          slidesToScroll: 1,
          responsive: [{
            breakpoint: 768,
            settings: {
              slidesToShow: 1
            }
          }]
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create image gallery.
   */
  Drupal.behaviors.iframePrint = {
    attach: function attach(context) {
      $('#main-content', context).once('iframePrint').each(function (index, element) {
        var body = $(element);
        var count = 0;
        var timer = setInterval(function () {
          var newIframes = body.find('iframe');
          if (newIframes.length > count) {
            count = newIframes.length;
          } else {
            clearInterval(timer);
            newIframes.each(function (index, element) {
              var $this = $(element);
              $("<div class='iframePrint'><p>Cet Ã©lÃ©ment n'est pas imprimable.</p></div>").insertAfter($this);
            });
          }
        }, 1000);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create kiosque tabs.
   */
  Drupal.behaviors.ivacChartesBehavior = {
    attach: function attach(context) {
      $('.ivac .iva-charts', context).once('ivacChartesBehavior').each(function (index, element) {
        var $mainElement = $(element);
        var $oldIvalPage = $mainElement.parents('body').find('.resultats_lycee');
        var sourceTables = '';
        if ($oldIvalPage.length) {
          sourceTables = $oldIvalPage.find('table');
        } else {
          sourceTables = $mainElement.parents('body').find('.table_pyjama');
        }
        var $typeSource = $(element).parents('body').find('.iva-charts-type');
        $typeSource.hide();
        var $typeSourceText = $typeSource.text();
        var seriesArray = [];
        var charts = [];
        function createTittle(title) {
          var arr = title.split(' ');
          arr.pop();
          return arr.join(' ');
        }
        setTimeout(function () {
          if (sourceTables.length) {
            var setOptions = function setOptions(options, idx) {
              return {
                series: [0, 0],
                chart: {
                  height: '240px',
                  type: 'radialBar',
                  id: "Chart_".concat(idx)
                },
                plotOptions: {
                  radialBar: {
                    offsetY: 0,
                    startAngle: 0,
                    // endAngle: 270,
                    hollow: {
                      margin: 0,
                      size: '45%',
                      background: 'transparent',
                      image: undefined
                    },
                    track: {
                      margin: 0
                    },
                    dataLabels: {
                      name: {
                        show: false
                      },
                      value: {
                        show: false
                      }
                    }
                  }
                },
                colors: [drupalSettings.charts_color.observed_color, drupalSettings.charts_color.expected_color],
                labels: ['ATTENDU', 'constatÃ©'],
                legend: {
                  show: true,
                  floating: true,
                  fontSize: '12px',
                  position: 'bottom',
                  offsetX: 0,
                  offsetY: 0,
                  labels: {
                    useSeriesColors: true
                  },
                  markers: {
                    size: 0
                  },
                  formatter: function formatter(seriesName, opts) {
                    return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
                  },
                  itemMargin: {
                    vertical: 1
                  }
                },
                responsive: [{
                  breakpoint: 480,
                  options: {
                    legend: {
                      show: true
                    }
                  }
                }]
              };
            };
            var showChart = function showChart(name, id, idDom, opt, callBack) {
              var name = new ApexCharts(document.querySelector(id), callBack);
              charts.push(name);
              var point = document.createElement('div');
              point.classList.add('iva-charts__point');
              point.innerHTML = opt.point;
              var parentDiv = document.getElementById(idDom).closest('.iva-charts__container');
              parentDiv.append(point);
            };
            var $titlesArr = [createTittle(document.querySelector('#edugouv-summary-item-0').innerText.toUpperCase().replace('DIPLÃ”ME NATIONAL DU BREVET', 'DNB')), createTittle(document.querySelector('#edugouv-summary-item-1').innerText.toUpperCase().replace('DIPLÃ”ME NATIONAL DU BREVET', 'DNB'))];
            sourceTables.each(function (index, element) {
              if (index === 1 || index === 0) {
                var isThead = $(element).find('thead');
                var numberOfRow;
                if (isThead.length) {
                  numberOfRow = 0;
                } else {
                  numberOfRow = 1;
                }
                var $observedRate = $(element).find("tbody tr:eq(".concat(numberOfRow, ") td:eq(2)")).text();
                var $expectedTate = $(element).find("tbody tr:eq(".concat(numberOfRow, ") td:eq(1)")).text();
                var addedValText = $(element).find("tbody tr:eq(".concat(numberOfRow, ") td:eq(3)")).text();
                var $addvalue = addedValText === 'ND' ? 'ND' : addedValText.replace(',', '.');
                var $addvalueClass = '';
                var $pointEnd = 's';
                if (index === 1) {
                  var observedText = $(element).find("tbody tr:eq(".concat(numberOfRow, ") td:eq(2)")).text();
                  var expectedText = $(element).find("tbody tr:eq(".concat(numberOfRow, ") td:eq(1)")).text();
                  $observedRate = observedText === 'ND' ? 0 : 100 / 20 * observedText.replace(',', '.');
                  $expectedTate = expectedText === 'ND' ? 0 : 100 / 20 * expectedText.replace(',', '.');
                }
                if ($observedRate === "ND") {
                  $observedRate = 0;
                }
                if ($expectedTate === "ND") {
                  $expectedTate = 0;
                }
                if ($typeSourceText === 'GENERAL_TECHNO' || $typeSourceText === 'Lycee general et technologique') {
                  $mainElement.addClass('iva-charts--general-techno');
                } else if ($typeSourceText === 'PRO' || $typeSourceText === 'Lycee professionnel') {
                  $mainElement.addClass('iva-charts--pro');
                }

                // if ($typeSourceText === 'GENERAL_TECHNO' || $typeSourceText === 'Lycee general et technologique') {
                if (index === 1) {
                  if ($addvalue < -0.5) {
                    $addvalueClass = 'ivac-charts__point--small';
                  } else if ($addvalue >= -0.5 && $addvalue <= 0.5) {
                    $addvalueClass = 'ivac-charts__point--middle';
                  } else if ($addvalue > 0.5) {
                    $addvalueClass = 'ivac-charts__point--big';
                  }
                } else {
                  if ($addvalue < -3) {
                    $addvalueClass = 'iva-charts__point--small';
                  } else if ($addvalue > -4 && $addvalue < 4) {
                    $addvalueClass = 'iva-charts__point--middle';
                  } else if ($addvalue > 3) {
                    $addvalueClass = 'iva-charts__point--big';
                  }
                }

                // }
                //
                // if ($typeSourceText === 'PRO' || $typeSourceText === 'Lycee professionnel') {
                //   if ($addvalue < -5) {
                //     $addvalueClass = 'iva-charts__point--small';
                //   } else if ($addvalue > -6 && $addvalue < 6) {
                //     $addvalueClass = 'iva-charts__point--middle';
                //   } else if ($addvalue > 5) {
                //     $addvalueClass = 'iva-charts__point--big';
                //   }
                // }

                if ($addvalue > -2 && $addvalue < 2) {
                  $pointEnd = '';
                }

                // if (index === 1) {
                //   if ($addvalue > -2 && $addvalue < 2) {
                //     $pointEnd = '';
                //   }
                // }

                $mainElement.append("<div class='iva-charts__block'>\n                <div class='iva-charts__inner'>\n                  <div class='iva-charts__title'>\n                    ".concat($titlesArr[index], "\n                  </div>\n                  <div class='iva-charts__container'>\n                    <div id='iva-chartsId-").concat(index, "'></div>\n                  </div>\n                </div>\n              </div>"));
                var chartObj = {
                  series: [$observedRate, $expectedTate],
                  point: "<i class=\"".concat($addvalueClass, "\">").concat($addvalue, "</i><span>point").concat($pointEnd, "</span>")
                };
                showChart(index, "#iva-chartsId-".concat(index), "iva-chartsId-".concat(index), chartObj, setOptions(chartObj, index));
                seriesArray.push(chartObj.series);
              }
            });
          } else {
            $mainElement.hide();
          }
        });
        function renderCharts() {
          $('.iva-charts__inner').each(function (i, chart) {
            charts[i].render();
            var legend = $(chart).find('.apexcharts-legend');
            legend.appendTo($(chart));
          });
        }
        function checkCharts() {
          $('.iva-charts__inner').each(function (i, chart) {
            if (chart.getBoundingClientRect().top < window.innerHeight - 200) {
              if (!chart.classList.contains('animate')) {
                // charts[i].render();

                charts[i].updateOptions({
                  series: [seriesArray[i][0], seriesArray[i][1]]
                });
                var legends = $(chart).find('.apexcharts-legend');
                if (i === 1) {
                  legends.find('.apexcharts-legend-series:first .apexcharts-legend-text').text("ATTENDUE: ".concat(seriesArray[i][0] / 5, " / 20"));
                  legends.find('.apexcharts-legend-series:last .apexcharts-legend-text').text("constat\xE9e: ".concat(seriesArray[i][1] / 5, " / 20"));
                } else {
                  legends.find('.apexcharts-legend-series:first .apexcharts-legend-text').text("ATTENDU: ".concat(seriesArray[i][0], "%"));
                  legends.find('.apexcharts-legend-series:last .apexcharts-legend-text').text("constat\xE9: ".concat(seriesArray[i][1], "%"));
                }
                chart.classList.add('animate');
              }
            }
          });
        }
        setTimeout(function () {
          renderCharts();
          checkCharts();
        }, 10);
        $(window).on('scroll', function () {
          checkCharts();
        });
        var $parenWrapper = $(element).closest('.page-wrapper');
        var $breadcrumbList = $parenWrapper.find('.breadcrumb ol li');
        var $prewPageItem = $breadcrumbList[$breadcrumbList.length - 2];
        var prewPageLink = $prewPageItem.querySelector('a');
        if (prewPageLink) {
          prewPageLink.addEventListener("click", function (e) {
            var previousPageUrl = document.referrer;
            if (previousPageUrl && previousPageUrl.includes('recherche-ivac')) {
              e.preventDefault();
              window.history.back();
            }
          });
        }
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create  ivacIvalSearch.
   */
  Drupal.behaviors.ivacIvalSearchBehavior = {
    attach: function attach(context) {
      $('form[data-drupal-selector=views-exposed-form-search-ival-page-main]', context).once('ivacIvalSearchBehavior').each(function (index, element) {
        var cityField = element.querySelector('#edit-city');
        var departnemt = element.querySelector('#edit-department');
        if (cityField) {
          $(cityField).autocomplete({
            select: function select(event, ui) {
              if (departnemt) {
                departnemt.value = ui.item.departments;
              }
            }
          });
        }
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create kiosque tabs.
   */
  Drupal.behaviors.ivalChartesBehavior = {
    attach: function attach(context) {
      $('.ival .iva-charts', context).once('ivaCharts').each(function (index, element) {
        var $mainElement = $(element);
        var $oldIvalPage = $mainElement.parents('body').find('.resultats_lycee');
        var sourceTables = '';
        if ($oldIvalPage.length) {
          sourceTables = $oldIvalPage.find('table');
        } else {
          sourceTables = $mainElement.parents('body').find('.table_pyjama');
        }
        var $typeSource = $(element).parents('body').find('.iva-charts-type');
        $typeSource.hide();
        var $typeSourceText = $typeSource.text();
        var seriesArray = [];
        var charts = [];
        if (sourceTables.length) {
          var setOptions = function setOptions(options, idx) {
            return {
              series: [0, 0],
              chart: {
                height: '240px',
                type: 'radialBar',
                id: "Chart_".concat(idx)
              },
              plotOptions: {
                radialBar: {
                  offsetY: 0,
                  startAngle: 0,
                  // endAngle: 270,
                  hollow: {
                    margin: 0,
                    size: '45%',
                    background: 'transparent',
                    image: undefined
                  },
                  track: {
                    margin: 0
                  },
                  dataLabels: {
                    name: {
                      show: false
                    },
                    value: {
                      show: false
                    }
                  }
                }
              },
              colors: [drupalSettings.charts_color.observed_color, drupalSettings.charts_color.expected_color],
              labels: ['ATTENDU', 'constatÃ©'],
              legend: {
                show: true,
                floating: true,
                fontSize: '12px',
                position: 'bottom',
                offsetX: 0,
                offsetY: 0,
                labels: {
                  useSeriesColors: true
                },
                markers: {
                  size: 0
                },
                formatter: function formatter(seriesName, opts) {
                  return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
                },
                itemMargin: {
                  vertical: 1
                }
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  legend: {
                    show: true
                  }
                }
              }]
            };
          };
          var showChart = function showChart(name, id, idDom, opt, callBack) {
            var name = new ApexCharts(document.querySelector(id), callBack);
            charts.push(name);
            var point = document.createElement('div');
            point.classList.add('iva-charts__point');
            point.innerHTML = opt.point;
            var parentDiv = document.getElementById(idDom).closest('.iva-charts__container');
            parentDiv.append(point);
          };
          sourceTables.each(function (index, element) {
            var $titlesArr = ["Taux de r\xE9ussite au baccalaur\xE9at", "Taux d'acc\xE8s de la seconde au baccalaur\xE9at", "Taux de mentions au baccalaur\xE9at"];
            var isThead = $(element).find('thead');
            var numberOfRow;
            if (isThead.length) {
              numberOfRow = 0;
            } else {
              numberOfRow = 1;
            }
            var $observedRate = $(element).find("tbody tr:eq(".concat(numberOfRow, ") td:eq(2)")).text();
            var $expectedTate = $(element).find("tbody tr:eq(".concat(numberOfRow, ") td:eq(1)")).text();
            var $addvalue = $(element).find("tbody tr:eq(".concat(numberOfRow, ") td:eq(3)")).text();
            var $addvalueClass = '';
            var $pointEnd = 's';
            if ($observedRate === "ND") {
              $observedRate = 0;
            }
            if ($expectedTate === "ND") {
              $expectedTate = 0;
            }
            if ($typeSourceText === 'GENERAL_TECHNO' || $typeSourceText === 'Lycee general et technologique') {
              $mainElement.addClass('iva-charts--general-techno');
            } else if ($typeSourceText === 'PRO' || $typeSourceText === 'Lycee professionnel') {
              $mainElement.addClass('iva-charts--pro');
            }
            if ($typeSourceText === 'GENERAL_TECHNO' || $typeSourceText === 'Lycee general et technologique') {
              if ($addvalue < -3) {
                $addvalueClass = 'iva-charts__point--small';
              } else if ($addvalue > -4 && $addvalue < 4) {
                $addvalueClass = 'iva-charts__point--middle';
              } else if ($addvalue > 3) {
                $addvalueClass = 'iva-charts__point--big';
              }
            }
            if ($typeSourceText === 'PRO' || $typeSourceText === 'Lycee professionnel') {
              if ($addvalue < -5) {
                $addvalueClass = 'iva-charts__point--small';
              } else if ($addvalue > -6 && $addvalue < 6) {
                $addvalueClass = 'iva-charts__point--middle';
              } else if ($addvalue > 5) {
                $addvalueClass = 'iva-charts__point--big';
              }
            }
            if ($addvalue >= -1 && $addvalue <= 1) {
              $pointEnd = '';
            }
            $mainElement.append("<div class='iva-charts__block'>\n                <div class='iva-charts__inner'>\n                  <div class='iva-charts__title'>\n                    ".concat($titlesArr[index], "\n                  </div>\n                  <div class='iva-charts__container'>\n                    <div id='iva-chartsId-").concat(index, "'></div>\n                  </div>\n                </div>\n              </div>"));
            var chartObj = {
              series: [$observedRate, $expectedTate],
              point: "<i class=\"".concat($addvalueClass, "\">").concat($addvalue, "</i><span>point").concat($pointEnd, "</span>")
            };
            showChart(index, "#iva-chartsId-".concat(index), "iva-chartsId-".concat(index), chartObj, setOptions(chartObj, index));
            seriesArray.push(chartObj.series);
          });
        } else {
          $mainElement.hide();
        }
        function renderCharts() {
          $('.iva-charts__inner').each(function (i, chart) {
            charts[i].render();
            var legend = $(chart).find('.apexcharts-legend');
            legend.appendTo($(chart));
          });
        }
        function checkCharts() {
          $('.iva-charts__inner').each(function (i, chart) {
            if (chart.getBoundingClientRect().top < window.innerHeight - 200) {
              if (!chart.classList.contains('animate')) {
                // charts[i].render();

                charts[i].updateOptions({
                  series: [seriesArray[i][0], seriesArray[i][1]]
                });
                var legends = $(chart).find('.apexcharts-legend');
                legends.find('.apexcharts-legend-series:first .apexcharts-legend-text').text("ATTENDU: ".concat(seriesArray[i][0], "%"));
                legends.find('.apexcharts-legend-series:last .apexcharts-legend-text').text("constat\xE9: ".concat(seriesArray[i][1], "%"));
                chart.classList.add('animate');
              }
            }
          });
        }
        setTimeout(function () {
          renderCharts();
          checkCharts();
        }, 10);
        $(window).on('scroll', function () {
          checkCharts();
        });
        var $parenWrapper = $(element).closest('.page-wrapper');
        var $breadcrumbList = $parenWrapper.find('.breadcrumb ol li');
        var $prewPageItem = $breadcrumbList[$breadcrumbList.length - 2];
        var prewPageLink = $prewPageItem.querySelector('a');
        if (prewPageLink) {
          prewPageLink.addEventListener("click", function (e) {
            var previousPageUrl = document.referrer;
            if (previousPageUrl && previousPageUrl.includes('recherche-ival')) {
              e.preventDefault();
              window.history.back();
            }
          });
        }
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create sticky header.
   */
  Drupal.behaviors.edugouvMobileSlider = {
    attach: function attach(context) {
      $('.js-slick--mobile', context).once('edugouvMobileSlider').each(function (index, element) {
        var $slider = $(element);
        var toggleSlider = function toggleSlider(mq) {
          if (mq.matches) {
            $slider.slick({
              dots: true,
              infinite: false,
              arrows: false,
              adaptiveHeight: true
            });
          } else if ($slider.hasClass('slick-initialized')) {
            $slider.slick('unslick');
          }
        };
        var mq = window.matchMedia('(max-width: 767px)');
        mq.addListener(toggleSlider);
        toggleSlider(mq);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create partner slider.
   */
  Drupal.behaviors.edugouvPartnerSlider = {
    attach: function attach(context) {
      $('.js-slick--partner', context).once('edugouvPartnerSlider').each(function (index, element) {
        var $slider = $(element);
        $slider.slick({
          infinite: true,
          slidesToShow: 3,
          slidesToScroll: 3,
          dots: false,
          responsive: [{
            breakpoint: 1024,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          }, {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              dots: true,
              arrows: false
            }
          }]
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create image gallery.
   */
  Drupal.behaviors.edugouvMasonry = {
    attach: function attach(context) {
      $('.js-vertical-masonry', context).once('edugouvMasonry').each(function (index, element) {
        var loadedImages = 0;
        var $this = $(element);
        var $images = $('img', $this);
        var $gridItem = $('.grid-item:not(.load-more)', $this);
        var $initialLength = $gridItem.length;
        var imageLoaded = function imageLoaded() {
          loadedImages += 1;
          if (loadedImages === $images.length) {
            $this.isotope({
              itemSelector: '.grid-item',
              layoutMode: 'masonry',
              masonry: {
                gutter: '.gutter-sizer',
                columnWidth: '.grid-sizer'
              }
            });
          }
        };
        if ($images.length) {
          $this.addClass('loading');
          $images.each(function (i, image) {
            $('<img>').on('load', imageLoaded).attr('src', $(image).attr('src'));
          });
        } else {
          $this.isotope({
            itemSelector: '.grid-item',
            layoutMode: 'masonry',
            masonry: {
              gutter: '.gutter-sizer',
              columnWidth: '.grid-sizer'
            }
          });
        }
        $(document).ajaxComplete(function () {
          var $actualGridItem = $('.grid-item:not(.load-more)', $this);
          var $actualLength = $actualGridItem.length;
          if ($this.data('isotope')) {
            $images = $('img', $this);
            loadedImages = 0;
            imageLoaded = function imageLoaded() {
              loadedImages += 1;
              if (loadedImages === $images.length) {
                $this.isotope('reloadItems').isotope({
                  sortBy: 'original-order'
                });
              }
            };
            if ($images.length) {
              $this.addClass('loading');
              $images.each(function (i, image) {
                $('<img>').on('load', imageLoaded).attr('src', $(image).attr('src'));
              });
            } else {
              $this.isotope('reloadItems').isotope({
                sortBy: 'original-order'
              });
            }
            if ($actualLength > $initialLength) {
              $actualGridItem[$actualLength - $initialLength].focus();
            }
          }
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create publication slider.
   */
  Drupal.behaviors.edugouvPublicationSlider = {
    attach: function attach(context) {
      $('.js-publication-slider', context).once('edugouvPublicationSlider').each(function (index, element) {
        var $slider = $(element);
        var $titles = $('.publication__title', $slider);
        $slider.slick({
          infinite: false,
          arrows: false,
          dots: true,
          customPaging: function customPaging(slider, i) {
            return "<button class=\"slick-dot\" aria-labelledby=\"slide-publication-item-title".concat(i + 1, "\">").concat($titles.eq(i).text().trim(), "</button>");
          }
        });
        var $sliderContainer = document.querySelectorAll('.block--publication-slider');
        var $slideTitles = $sliderContainer[0].querySelectorAll('.publication__slide:not(.slick-cloned) .publication__title a');
        $slider.on('afterChange', function () {
          $slider.find('.slick-dots li button').blur();
          $slider.find('.slick-dots .slick-active button').focus();
          setTimeout(function () {
            $('.slick-slide').removeAttr('aria-describedby');
          }, 1);
        });
        $slideTitles.forEach(function (item, i) {
          $(item).attr('id', "slide-publication-item-title".concat(i + 1));
          $(item).closest('.slick-slide').removeAttr('aria-describedby');
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create rich agenda block.
   */
  Drupal.behaviors.edugouvRichAgenda = {
    attach: function attach(context) {
      $('.js-rich-agenda', context).once('edugouvRichAgenda').each(function (index, element) {
        var $element = $(element);
        var $blockTwitters = $('.block-twitters', $element);
        var $eventsHeight = $element.find('.block-events').height();
        var $allBlockEventItems = $('.event-item', $element);
        var $blockEvent = $element.find('.block-events');
        var firstColumn = [];
        var secondColumn = [];
        if ($eventsHeight > 465) {
          $blockTwitters.css({
            'max-height': $eventsHeight
          });
        }
        $.each($allBlockEventItems, function (i) {
          if (i < Math.round($allBlockEventItems.length / 2)) {
            firstColumn.push($allBlockEventItems[i]);
          } else {
            secondColumn.push($allBlockEventItems[i]);
          }
        });
        $blockEvent.append($('<div class="events-column"></div>').append(firstColumn));
        $blockEvent.append($('<div class="events-column"></div>').append(secondColumn));
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create subevents.
   */
  Drupal.behaviors.edugouvSubevents = {
    attach: function attach(context) {
      $('.subevents__block', context).once('edugouvSubevents').each(function () {
        var render = function render(elements) {
          var day = 86400000;
          var firstDate = new Date(elements[0].startTime * 1000);
          var lastDate = new Date(elements[elements.length - 1].endTime * 1000);
          var allDays = Math.abs(firstDate.getTime() - lastDate.getTime()) / day;
          var dayWidth = 100 / allDays;
          var prevEventEnd = firstDate.getTime();
          var today = {};
          today.date = new Date();
          today.position = Math.abs((firstDate.getTime() - today.date.getTime()) / day);
          today.outEvent = true;
          today.gutterWidth = dayWidth;
          today.lang = drupalSettings.path ? drupalSettings.path.currentLanguage : 'en';
          if (today.date < firstDate) {
            today.position = -2;
            today.gutterWidth = 1;
          } else if (today.date > lastDate) {
            today.position = 102;
            today.gutterWidth = 1;
          }
          $('.subevents__block').append('<div class="subevents__wrapper"><div class="subevents"></div></div>');
          for (var i = 0; i < elements.length; i += 1) {
            var event = elements[i];
            var startDate = new Date(event.startTime * 1000);
            var endDate = new Date(event.endTime * 1000);
            var eventInPast = startDate < today.date ? 'past' : 'future';
            var eventDuration = Math.abs(startDate.getTime() - endDate.getTime()) / day;
            var eventMargin = Math.abs(prevEventEnd - startDate.getTime()) / day;
            eventDuration = eventDuration > 0 ? eventDuration : 1;
            eventMargin = eventMargin > -1 ? eventMargin : 0;
            var startText = event.freeText !== null ? event.freeText : "".concat(startDate.getDate(), " ").concat(startDate.toLocaleString(today.lang, {
              month: 'short'
            }), " ").concat(startDate.getFullYear());
            prevEventEnd = endDate.getTime();
            if (today.date < endDate && today.date > startDate) {
              today.outEvent = false;
              today.gutterWidth = 100 / eventDuration;
              today.position = Math.abs((startDate.getTime() - today.date.getTime()) / day);
            }
            $('.subevents').append("<div style=\"width: ".concat(dayWidth * eventDuration, "%; margin-left: ").concat(dayWidth * eventMargin, "%\" class=\"subevent__item duration-").concat(parseInt(eventDuration, 10), " ").concat(eventInPast, "\">").concat(Drupal.theme('agendaSubEventCell', event, startText, today), "</div>"));
          }
          if (today.outEvent) {
            $('.subevents__wrapper').append("<div class=\"current__date\" style=\"left: ".concat(today.gutterWidth * today.position, "%;\">").concat(Drupal.t('Today'), "<span class=\"current__date__circle\"><span class=\"date\">").concat(today.date.getDate(), "</span><span class=\"month\">").concat(today.date.toLocaleString(today.lang, {
              month: 'short'
            }), "</span></span></div>"));
          }
          var $slider = $('.subevents');
          var toggleSlider = function toggleSlider(mq) {
            if (mq.matches && $slider[0].children.length > 1) {
              $slider.slick({
                dots: false,
                infinite: false,
                arrows: true,
                slidesToShow: 1
              });
            } else if ($slider.hasClass('slick-initialized')) {
              $slider.slick('unslick');
            }
          };
          var mq = window.matchMedia('(max-width: 767px)');
          mq.addListener(toggleSlider);
          toggleSlider(mq);
        };
        var basePath = drupalSettings.path ? drupalSettings.path.baseUrl : '/';
        var eventID = drupalSettings.edugouv_event.eventId;
        $.get("".concat(basePath, "api/v1/sub-events-list/").concat(eventID)).done(function (response) {
          render(response);
        }).fail(function (error) {
          throw new Error(error);
        });
      });
    }
  };
  /**
   * Theme for subevent cell.
   */
  Drupal.theme.agendaSubEventCell = function (event, eventStart, today) {
    var output = '';
    output += '<div class="event__mobile_wrapper">';
    if (today.outEvent || $('.current__date').length >= 1) {
      output += '<div class="event__content">';
      output += "<div class=\"event__title\">".concat(event.title, "</div>");
      output += "<div class=\"event__start__text\">".concat(eventStart, "</div>");
      output += '</div>';
    } else {
      output += "<div class=\"current__date\" style=\"left: ".concat(today.gutterWidth * today.position, "%;\">");
      output += "".concat(Drupal.t('Today'));
      output += '<span class="current__date__circle">';
      output += "<span class=\"date\">".concat(today.date.getDate(), "</span>");
      output += "<span class=\"month\">".concat(today.date.toLocaleString(today.lang, {
        month: 'short'
      }), "</span>");
      output += '</span>';
      output += '<div class="current__date__content">';
      output += "<div class=\"event__title\">".concat(event.title, "</div>");
      output += "<div class=\"event__start__text\">".concat(eventStart, "</div>");
      output += '</div>';
      output += '</div>';
    }
    output += '</div>';
    return output;
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create service slider.
   */
  Drupal.behaviors.edugouvThematicSlider = {
    attach: function attach(context) {
      $('.js-slick--thematic-slider', context).once('edugouvThematicSlider').each(function (index, element) {
        var $slider = $(element);
        $slider.slick({
          infinite: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          centerMode: true,
          centerPadding: '75px',
          responsive: [{
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              centerPadding: '0px',
              centerMode: false
            }
          }]
        });
        var $nextSlide = $('.slick-next');
        var $prevSlide = $('.slick-prev');
        var $translatableAriaNext = Drupal.t('Next slide');
        var $translatableAriaPrev = Drupal.t('Previous slide');
        $nextSlide.attr('aria-label', $translatableAriaNext);
        $prevSlide.attr('aria-label', $translatableAriaPrev);
        var $sliderContainer = document.querySelectorAll('.thematic-page-slider');
        $sliderContainer.forEach(function (item, i) {
          $(item).find('h2').attr('id', "title-thematic-page-slider".concat(i + 1));
          $(item).find('.slick-dots').attr('aria-labelledby', "title-thematic-page-slider".concat(i + 1));
          $(item).find('.js-slick--thematic-slider').attr('aria-labelledby', "title-thematic-page-slider".concat(i + 1));
        });
        var $slideTitles = $sliderContainer[0].querySelectorAll('.thematic-page-slide:not(.slick-cloned) h3');
        var $slickDots = $sliderContainer[0].querySelectorAll('.slick-dots li');
        $slider.on('afterChange', function () {
          setTimeout(function () {
            $('.slick-slide').removeAttr('aria-describedby');
            $slider.find('.slick-dots li button').attr('tabindex', '0');
          }, 1);
        });
        $slideTitles.forEach(function (item, i) {
          $(item).attr('id', "slide-thematic-title".concat(i + 1));
          $(item).closest('.thematic-page-slide').removeAttr('aria-describedby');
        });
        $slickDots.forEach(function (item, i) {
          $(item).attr('aria-labelledby', "slide-thematic-title".concat(i + 1));
        });
        function moveList() {
          var list = $slider.find('.slick-list');
          $slider.append(list);
        }
        setTimeout(moveList(), 0);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create service slider.
   */
  Drupal.behaviors.edugouvServicesSlider = {
    attach: function attach(context) {
      $('.js-slick--services', context).once('edugouvServicesSlider').each(function (index, element) {
        var $slider = $(element);
        var sliderInfinite = true;
        var sliderDots = true;
        var sliderCenterMode = true;
        if ($('.thematic-services-item', $slider).length <= 3) {
          sliderInfinite = false;
          sliderDots = false;
          sliderCenterMode = false;
        }
        $slider.slick({
          infinite: sliderInfinite,
          slidesToShow: 3,
          slidesToScroll: 1,
          centerMode: sliderCenterMode,
          dots: sliderDots,
          responsive: [{
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              dots: true,
              arrows: false,
              centerMode: false
            }
          }]
        });
        var $nextSlide = $('.slick-next');
        var $prevSlide = $('.slick-prev');
        var $translatableAriaNext = Drupal.t('Next slide');
        var $translatableAriaPrev = Drupal.t('Previous slide');
        $nextSlide.attr('aria-label', $translatableAriaNext);
        $prevSlide.attr('aria-label', $translatableAriaPrev);
        $nextSlide.html(Drupal.t('Next'));
        $prevSlide.html(Drupal.t('Previous'));
        var $sliderContainer = document.querySelectorAll('.services-slider__wrapper');
        $sliderContainer.forEach(function (item, i) {
          $(item).find('h2').attr('id', "title-services-item-slider".concat(i + 1).concat(index));
          $(item).find('.slick-dots').attr('aria-labelledby', "title-thematic-page-slider".concat(i + 1).concat(index));
          $(item).find('.js-slick--services').attr('aria-labelledby', "title-services-item-slider".concat(i + 1).concat(index));
        });
        var $slideTitles = $sliderContainer[0].querySelectorAll('.thematic-services-item:not(.slick-cloned) h3');
        var $slickDots = $sliderContainer[0].querySelectorAll('.slick-dots li');
        $slider.on('afterChange', function () {
          setTimeout(function () {
            // $('.slick-slide').removeAttr('aria-describedby');
            $slider.find('.slick-dots li button').attr('tabindex', '0');
          }, 1);
        });
        $slideTitles.forEach(function (item, i) {
          $(item).attr('id', "slide-services-item-title".concat(i + 1).concat(index));
          // $(item).closest('.thematic-services-item').removeAttr('aria-describedby');
        });

        $slickDots.forEach(function (item, i) {
          $(item).attr('aria-labelledby', "slide-services-item-title".concat(i + 1).concat(index));
          $(item).find('button').attr('aria-label', "".concat(i + 1, " ").concat(Drupal.t('of'), " ").concat($slickDots.length));
        });
        function moveList() {
          var list = $slider.find('.slick-list');
          $slider.append(list);
        }
        var $slides = $sliderContainer[0].querySelectorAll('.thematic-services-item');
        $slides.forEach(function (item) {
          var idAttribute = item.getAttribute('id');
          if (idAttribute && idAttribute != '') {
            var trimedIdtext = idAttribute.trim();
            item.setAttribute('id', trimedIdtext);
          } else {
            item.removeAttribute('id');
          }
        });
        function checkDotsAndSlides() {
          var slides = $sliderContainer[0].querySelectorAll('.thematic-page-slide:not(.slick-cloned)');
          if ($slickDots.length < slides.length) {
            $sliderContainer[0].querySelector('.slick-dots').classList.add('hide-dots');
            slides.forEach(function (slide) {
              slide.removeAttribute('aria-describedby');
            });
          } else {
            $sliderContainer[0].querySelector('.slick-dots').classList.remove('hide-dots');
          }
        }
        checkDotsAndSlides();
        setTimeout(moveList(), 0);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create video transcription.
   */
  Drupal.behaviors.edugouvVideoTranscription = {
    attach: function attach(context) {
      $('.js-video-transcription', context).once('edugouvVideoTranscription').each(function () {
        $(document).once('edugouvVideoTranscription').on('click', '.video-transcription-trigger', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var $this = $(e.target);
          var accordionPanel = $this.next('.transcription');
          if (accordionPanel[0].hasAttribute('hidden')) {
            $this.attr('aria-expanded', true).text(Drupal.t('Hide the textual transcription'));
            accordionPanel[0].removeAttribute('hidden');
          } else {
            $this.attr('aria-expanded', false).text(Drupal.t('Show the textual transcription'));
            accordionPanel[0].setAttribute('hidden', '');
          }
        });
        $(document).once('edugouvVideoTranscription').on('keydown', '.video-transcription-trigger', function (e) {
          var code = e.keyCode || e.which;
          if (code === 13 || code === 32) {
            e.preventDefault();
            e.stopPropagation();
            e.target.click();
          }
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function (Modernizr, $, Drupal) {
  /**
   * Create map.
   */
  Modernizr.addTest('ipad', function () {
    return !!navigator.userAgent.match(/iPad/i);
  });
  Modernizr.addTest('iphone', function () {
    return !!navigator.userAgent.match(/iPhone/i);
  });
  Modernizr.addTest('ipod', function () {
    return !!navigator.userAgent.match(/iPod/i);
  });
  Modernizr.addTest('ios', function () {
    return Modernizr.ipad || Modernizr.ipod || Modernizr.iphone;
  });
  Drupal.behaviors.edugouvMap = {
    attach: function attach(context) {
      $('.js-map', context).once('edugouvMap').each(function (index, element) {
        var lat = $(element).data('lat');
        var lon = $(element).data('lon');
        var baseUrl = drupalSettings.path.baseUrl;
        var map = L.map('map').setView([lat, lon], 13);
        var mapIcon = L.icon({
          iconUrl: "".concat(baseUrl, "themes/custom/edugouv_theme/html/public/assets/images/marker.png"),
          iconSize: [43, 56],
          iconAnchor: [21, 56]
        });
        var mapCopyright = drupalSettings.osm_credit !== undefined ? jQuery.parseHTML(drupalSettings.osm_credit) : [''];
        map.attributionControl.setPrefix(false);
        if (mapCopyright.length) {
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: mapCopyright[0].innerHTML
          }).addTo(map);
        } else {
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        }
        L.marker([lat, lon], {
          icon: mapIcon
        }).addTo(map);
        var $isnextEl = $(element).closest('.one__column__header').next('.one__column__main').find('.container').children();
        var $isnextElLength = $isnextEl.length;
        if (!$isnextElLength) {
          $(element).closest('.one__column__header').next('.one__column__main').addClass('no-elements-block');
        }
      });
    }
  };
})(Modernizr, jQuery, Drupal);
"use strict";

(function (Modernizr, $, Drupal) {
  /**
   * Behavior to focus search input.
   */
  Drupal.behaviors.searchFieldAutofocus = {
    attach: function attach(context) {
      $('#search-banner-page', context).once('searchFieldAutofocus').each(function (index, element) {
        $(element).find('.edugouv-search-autocomplete input').focus();
        var searchInput = $('#edugouv-search-autocomplete');
        var admin = $('#toolbar-administration').length ? 80 : 0;
        $('html, body').animate({
          scrollTop: searchInput.offset().top - admin - searchInput.height() * 2
        }, 500);
      });
    }
  };
})(Modernizr, jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create subevents.
   */
  Drupal.behaviors.edugouvSubeventsHeader = {
    attach: function attach(context) {
      $('[data-event]', context).once('edugouvCalendarSubevents').each(function (index, element) {
        var render = function render(elements) {
          var day = 86400000;
          var firstDate = new Date(elements[0].startTime * 1000);
          var lastDate = new Date(elements[0].endTime * 1000);
          var lang = drupalSettings.path ? drupalSettings.path.currentLanguage : 'en';
          for (var i = 1; i < 3; i += 1) {
            var tempEnd = new Date(elements[i].endTime * 1000);
            if (tempEnd > lastDate) {
              lastDate = tempEnd;
            }
          }
          var allDays = Math.abs(firstDate.getTime() - lastDate.getTime()) / day;
          for (var _i = 0; _i < 3; _i += 1) {
            var event = elements[_i];
            var startDate = new Date(event.startTime * 1000);
            var endDate = new Date(event.endTime * 1000);
            var eventDuration = Math.abs(startDate.getTime() - endDate.getTime()) / day;
            var eventMargin = Math.abs(firstDate - startDate.getTime()) / day;
            eventDuration = eventDuration > 0.25 * allDays ? eventDuration / (0.25 * allDays) : 1;
            eventMargin = eventMargin > 0 ? eventMargin / (0.25 * allDays) : 0;
            var startDateString = "".concat(startDate.toLocaleString(lang, {
              weekday: 'long'
            }), " ").concat(startDate.getDate(), " ").concat(startDate.toLocaleString(lang, {
              month: 'long'
            }), " ").concat(startDate.getFullYear());
            var endDateString = "".concat(endDate.toLocaleString(lang, {
              weekday: 'long'
            }), " ").concat(endDate.getDate(), " ").concat(endDate.toLocaleString(lang, {
              month: 'long'
            }), " ").concat(endDate.getFullYear());
            var color = event.color !== null ? event.color : 'blue';
            $('.calendar_subevents').append("<div class=\"calendar_subevent\"><div class=\"calendar_subevent_progress\"><h3 class=\"calendar_subevent_progress_color ".concat(color, "\" style=\"width: ").concat(Math.round(eventDuration) * 25, "%; margin-left: ").concat(Math.round(eventMargin) * 25, "%;\">").concat(event.title, "</h3></div><p>").concat(Drupal.t('End of class'), ": <span>").concat(startDateString, "</span></p><p>").concat(Drupal.t('Resumption of classes'), ": <span>").concat(endDateString, "</span></p></div>"));
          }
        };
        var basePath = drupalSettings.path ? drupalSettings.path.baseUrl : '/';
        var eventID = $(element).data('event');
        $.get("".concat(basePath, "api/v1/sub-events-list/").concat(eventID)).done(function (response) {
          render(response);
        }).fail(function (error) {
          throw new Error(error);
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create mobile footer accordion.
   */
  Drupal.behaviors.edugouvFooterAccordion = {
    attach: function attach(context) {
      $('#footer-accordion-group', context).once('edugouvFooterAccordion').each(function (index, element) {
        var accordion = element;
        var accordionPanel = $('.panel', accordion);
        var mq = window.matchMedia('(max-width: 767px)');
        var nolink = $('> li > span', accordion);
        accordionPanel.each(function (accordionIndex, accordionElement) {
          var panel = $(accordionElement);
          var button = "<button aria-controls=\"".concat(panel.attr('id'), "\" aria-expanded=\"false\"></button>");
          $(button).insertBefore(panel);
        });
        var accordionTrigger = $('[aria-controls]', accordion);
        var enableMenu = function enableMenu(query) {
          if (query.matches) {
            nolink.click(function (e) {
              $(e.target).next('button').click();
            });
            accordionPanel.attr('hidden', '');
            accordionTrigger.attr('aria-expanded', 'false');
            accordionTrigger.first().attr('aria-expanded', 'true');
            accordionPanel.first().removeAttr('hidden');
            accordionTrigger.click(function (e) {
              e.preventDefault();
              e.stopPropagation();
              var target = e.target;
              var isExpanded = target.getAttribute('aria-expanded') === 'true';
              var active = accordion.querySelector('[aria-expanded="true"]');
              if (active && active !== target) {
                // Set the expanded state on the triggering element
                active.setAttribute('aria-expanded', 'false');
                // Hide the accordion sections, using aria-controls to specify the desired section
                document.getElementById(active.getAttribute('aria-controls')).setAttribute('hidden', '');
              }
              if (!isExpanded) {
                // Set the expanded state on the triggering element
                target.setAttribute('aria-expanded', 'true');
                // Hide the accordion sections, using aria-controls to specify the desired section
                document.getElementById(target.getAttribute('aria-controls')).removeAttribute('hidden');
              }
            });
            accordionTrigger.keydown(function (e) {
              var code = e.keyCode || e.which;
              if (code === 13 || code === 32) {
                e.preventDefault();
                e.stopPropagation();
                $(e.target).click();
              }
            });
          } else {
            accordionPanel.removeAttr('hidden');
            accordionTrigger.attr('aria-expanded', 'true');
          }
        };
        enableMenu(mq);
        mq.addListener(enableMenu);
      });
    }
  };
  /**
   * Scroll top button.
   */
  Drupal.behaviors.edugouvScrollTop = {
    attach: function attach(context) {
      $('.scroll__top', context).once('edugouvScrollTop').each(function (index, element) {
        var scrollTop = $(element);
        var $window = $(window);
        var $header = $('.js-header');
        var lastScrollTop = 0;
        var lastBackScroll = 700;
        $window.scroll(function () {
          var st = $window.scrollTop();
          scrollTop.toggleClass('show', st < lastBackScroll && $header.hasClass('fixed'));
          if (st + $window.height() === $(document).height()) {
            scrollTop.addClass('show');
          }
          if (st > lastScrollTop) {
            lastBackScroll = st - 700;
          }
          lastScrollTop = st;
        });
        scrollTop.on('click', function (e) {
          e.preventDefault();
          $('html, body').animate({
            scrollTop: 0
          }, '300');
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create mobile menu.
   */
  Drupal.behaviors.edugouvMobileMenu = {
    attach: function attach(context) {
      $('.main-menu .is-active:last').attr('aria-current', 'true');
      $('.js-menu-toggle', context).once('edugouvMobileMenu').each(function (index, element) {
        var $mainMenu = $('.main-menu');
        var firstLvlDrop = $('.first-lvl-drop');
        var $toSecondLvl = $('.to-second-lvl');
        var $toSecondLvlSpan = $toSecondLvl.siblings('span');
        $(element).click(function () {
          var toggleArea = $(element).attr('aria-expanded') === 'true' || false;
          $(element).toggleClass('is-active').attr('aria-expanded', !toggleArea).attr('aria-label', toggleArea ? Drupal.t('Open menu') : Drupal.t('Close menu'));
          $mainMenu.toggleClass('is-active');
          $('html').toggleClass('menu-open');
          firstLvlDrop.removeClass('is-active');
          $toSecondLvl.attr('aria-expanded', false);
        });
        $(element).keydown(function (e) {
          var code = e.keyCode || e.which;
          if (!e.shiftKey && code === 9 && $mainMenu.hasClass('is-active')) {
            e.preventDefault();
            $('.main-menu').find('>li:first-child > a').focus();
          }
        });
        $(document).keydown(function (e) {
          var code = e.keyCode || e.which;
          if (code === 27 && $(element).hasClass('is-active')) {
            if ($toSecondLvl.attr('aria-expanded') === 'true') {
              var currentSrcond = $('.to-second-lvl[aria-expanded="true"]');
              currentSrcond.focus();
              currentSrcond.attr('aria-expanded', false);
              firstLvlDrop.removeClass('is-active');
            } else {
              $(element).removeClass('is-active').attr('aria-expanded', false).attr('aria-label', Drupal.t('Close menu'));
              $(element).focus();
              $('html').removeClass('menu-open');
              firstLvlDrop.removeClass('is-active');
              $mainMenu.removeClass('is-active');
            }
          }
        });
        $('.main-menu').find('>li:first-child > a').keydown(function (e) {
          var code = e.keyCode || e.which;
          if (e.shiftKey && code === 9 && $mainMenu.hasClass('is-active')) {
            e.preventDefault();
            $(element).focus();
          }
        });
        $('.lvl-2').each(function (i, elem) {
          var backLinkText = $(elem).closest('li').find('> a, > span').text();
          $(elem).prepend("<li class=\"to-first-lvl\"><button type=\"button\" aria-label=\"".concat(Drupal.t('Close the submenu') + backLinkText, "\">").concat(backLinkText, "</button></li>"));
          $(elem).find('li:last-child a, li:last-child button').keydown(function (e) {
            var code = e.keyCode || e.which;
            if (!e.shiftKey && code === 9 && $mainMenu.hasClass('is-active') && $(e.target).next('button').length === 0) {
              e.preventDefault();
              $(elem).find('li:first-child >*').focus();
            }
          });
        });
        $('.to-first-lvl button').click(function (e) {
          $(e.currentTarget).closest('.first-lvl-drop').removeClass('is-active');
          $('.to-second-lvl').attr('aria-expanded', false);
          $(e.currentTarget).parents('li:not(.to-first-lvl)').find('> button').focus();
        });
        $('.to-first-lvl button').keydown(function (e) {
          var code = e.keyCode || e.which;
          if (e.shiftKey && code === 9 && $mainMenu.hasClass('is-active')) {
            e.preventDefault();
            $(e.currentTarget).parents('.lvl-2').find('li:last-child a').focus();
          }
        });
        $toSecondLvl.click(function (e) {
          var toggleArea = $(e.currentTarget).attr('aria-expanded') === 'true' || false;
          $(e.currentTarget).attr('aria-expanded', !toggleArea);
          $(e.currentTarget).next('.first-lvl-drop').toggleClass('is-active');
          $(e.currentTarget).next('.first-lvl-drop').find('.to-first-lvl button').focus();
        });
        $toSecondLvlSpan.click(function (e) {
          var toggleArea = $(e.currentTarget).attr('aria-expanded') === 'true' || false;
          $(e.currentTarget).attr('aria-expanded', !toggleArea);
          $(e.currentTarget).siblings('.first-lvl-drop').toggleClass('is-active');
          $(e.currentTarget).siblings('.first-lvl-drop').find('.to-first-lvl button').focus();
        });
        $('.main-menu, .first-lvl-drop').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
          var target = e.target;
          if (!$(target).hasClass('is-active')) {
            $(target).attr('style', 'visibility: hidden;');
          } else {
            $(target).attr('style', 'visibility: visible !important;');
          }
        });
      });
    }
  };

  /**
   * Add active class to parent link.
   */
  Drupal.behaviors.edugouvActiveParent = {
    attach: function attach(context) {
      setTimeout(function () {
        $('.main-menu .lvl-2 .is-active', context).once('edugouvActiveParent').each(function (index, element) {
          $(element).closest('.main-menu').find('a').removeAttr('aria-current');
          $(element).attr('aria-current', 'true');
          $(element).closest('.first-lvl-drop').parent('li').find('a, span').first().addClass('is-active');
          $(element).closest('.first-lvl-drop').parent('li').find('span').first().addClass('is-active');
        });
        $('.main-menu > li > a, .main-menu > li > span', context).once('edugouvActiveParent').each(function (index, element) {
          var title = $(element).prop('title') || $(element).html();
          $(element).filter('.is-active').prop('title', "".concat(title, " - rubrique active"));
          $(element).not('.is-active, [target="_blank"]').removeAttr('title');
        });
      }, 1);
    }
  };

  /**
   * Append Language switch to burger menu.
   */
  Drupal.behaviors.edugouvLanguageSwitchMobile = {
    attach: function attach(context) {
      $('.header', context).once('edugouvLanguageSwitchMobile').each(function () {
        var $mainMenu = $('.main-menu');
        var $languageSwitch = $('.language-switch > ul > li');
        $languageSwitch.first().addClass('language-switch-first');
        var appendMenu = function appendMenu(mq) {
          if (mq.matches) {
            $mainMenu.append($languageSwitch);
          }
        };
        var mq = window.matchMedia('(max-width: 769px)');
        mq.addListener(appendMenu);
        appendMenu(mq);
      });
    }
  };
  Drupal.behaviors.edugouvMainMenuDesktop = {
    attach: function attach(context) {
      $('.main-menu', context).once('edugouvMainMenuDesktop').each(function (index, element) {
        $(element).keydown(function (e) {
          var code = e.keyCode || e.which;
          if (!e.shiftKey && code === 27) {
            e.preventDefault();
            $(':focus').closest('.first-lvl-drop').parent('li').find('a, span').first().focus();
            $(':focus').parent('li').removeClass('active-1st-level');
          }
        });
        $(element).keydown(function (e) {
          var code = e.keyCode || e.which;
          if (!e.shiftKey && code === 13) {
            $(':focus').parent('li').addClass('active-1st-level');
          }
        });
        $(element).click(function () {
          $(':focus').parent('li').addClass('active-1st-level');
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create progress bar for article.
   */
  Drupal.behaviors.edugouvProgressBar = {
    attach: function attach(context) {
      $('.js-edugouv-progress-bar', context).once('edugouvProgressBar').each(function (index, element) {
        var bulletinTab = $(element).parents('.current-bulletin-pages__tab');
        var isBulletin = bulletinTab.length > 0;
        var $progressElement = isBulletin ? $(element).parents('.current-bulletin-pages__tab') : $('[class*="column--flex--main"]');
        var $progressBar = $(Drupal.theme('edugouvProgressBar')).prependTo(element);
        var $progress = $('.progress', $progressBar);
        var $header = $('.header');
        var $window = $(window);
        var $leftSidebar = $('.column--flex--side');
        var scrollWrapper = $(element).find('.custom-scrollbar-wrapper');
        if ($leftSidebar.find('> div').length > 1) {
          $leftSidebar.addClass('no-mobile-progress');
        }
        $('body').css('overflow', 'visible');

        // Make progress bar animation.
        var createProgress = function createProgress() {
          var percent = ($window.scrollTop() + $header.outerHeight() - $progressElement.offset().top) / $progressElement.height() * 100;
          $progress.css('width', "".concat(percent, "%"));
        };
        createProgress();
        $window.scroll(createProgress);
        if ($(element).hasClass('show-summary')) {
          var currentGapHeight = function currentGapHeight() {
            var topAdminToolbar = document.querySelector('#toolbar-bar');
            var botAdminToolbar = document.querySelector('.toolbar-tray-horizontal.is-active');
            var crisisMessage = document.querySelector('.back-office-message-tab');
            var miniSiteMenu = document.querySelector('.mini-site-menu-wrapper');
            var summaryBlock = document.querySelector('.js-edugouv-progress-bar');
            var sumBlockHeight = 0;
            if ($(window).width() >= 768) {
              sumBlockHeight = 0;
            } else {
              sumBlockHeight = summaryBlock ? summaryBlock.offsetHeight : 0;
            }
            var topAdminToolbarHeight = topAdminToolbar ? topAdminToolbar.offsetHeight : 0;
            var botAdminToolbarHeight = botAdminToolbar ? botAdminToolbar.offsetHeight : 0;
            var crisisMessageHeight = crisisMessage ? crisisMessage.offsetHeight : 0;
            var miniSiteMenuHeight = miniSiteMenu ? miniSiteMenu.offsetHeight : 0;
            return topAdminToolbarHeight + botAdminToolbarHeight + crisisMessageHeight + miniSiteMenuHeight + sumBlockHeight + $header.outerHeight();
          }; // Make highlights for summary navigation.
          var refreshTinyScroll = function refreshTinyScroll() {
            scrollWrapper.css('height', $(window).height() - (currentGapHeight() + $('.edugouv-progress-bar').innerHeight() + 25) + 'px');
            scrollWrapper.data('plugin_tinyscrollbar').update();
          };
          var $summary = $('<div class="edugouv-progress-summary viewport"><div class="overview"></div></div>').appendTo($(element).find('.custom-scrollbar-wrapper'));
          var $headingsFirst = $('.in-depth-wrapper > h2', $progressElement).not('.hide_summary');
          var $headingsSecond = $('.bo_detail').length ? $('.content-bo-detail .Stitre, .content-bo-detail .Stitre1, .content-bo-detail h2:not([class]), .content-bo-detail h3:not([class])', $progressElement).not('.hide_summary') : $('.ckeditor-text h2, .ckeditor-text h3:not(.thematic-page-slide__title)', $progressElement).not('.hide_summary');
          var $headingsThird = $('.edugouv-common-rubric-item h2, .edugouv-common-rubric-item h3', $progressElement);
          var $headingsFAQ = $('.faq-section.on_summary .faq-section__head h2, .faq-section.on_summary .faq-section__accordion h3.on_summary');
          var lastScroll = 0;
          var content = '';
          var $headings = $.merge($headingsFirst, $headingsSecond, $headingsThird, $headingsFAQ);
          var highlightSummary = function highlightSummary($sections, $links) {
            var scrollTop = isBulletin ? $window.scrollTop() + currentGapHeight() + 100 : $window.scrollTop() + currentGapHeight() + 100;
            for (var i = $sections.length - 1; i >= 0; i -= 1) {
              var $section = $sections.eq(i);
              var $parent = $links.closest('li');
              if (scrollTop >= $section.offset().top) {
                $parent.removeClass('active');
                $links.removeClass('active');
                $links.removeClass('active').filter("[href=\"#".concat($section.attr('id'), "\"]")).addClass('active').closest('li').addClass('active').closest('.edugouv-summary-item-group').addClass('active');
                scrollWrapper.css('height', summary.outerHeight() + margin + 'px');
                if (summary.outerHeight() + margin > viewportHeight) {
                  scrollWrapper.css('height', viewportHeight + 'px');
                  // Create custom scrollbar.
                  scrollWrapper.tinyscrollbar({
                    axis: 'y'
                  });
                } else {
                  scrollWrapper.find('.scrollbar').hide();
                  scrollWrapper.css('height', summary.outerHeight() + margin + 'px');
                  // scrollWrapper.css('height',   currentGapHeight());
                }

                return $links;
              }

              // Remove active state from first items when user scrolls up.
              if (lastScroll > scrollTop && scrollTop < $section.offset().top && i === 0) {
                $links.removeClass('active');
                $parent.removeClass('active');
              }
            }
            lastScroll = scrollTop;
            return true;
          };

          // Build summery navigation.
          $headings.each(function (i, heading) {
            var id = "edugouv-summary-item-".concat(i);
            $(heading).attr('id', id);
            if (i === 0) {
              content += '<ul>';
            }
            var linkClass = heading.tagName.toLowerCase() === 'div' ? heading.className : heading.tagName.toLowerCase();
            var link = "<a href=\"#".concat(id, "\" class=\"").concat(id, " ").concat(linkClass, "\">").concat(heading.innerText, "</a>");
            if (i !== 0) {
              if ($headings[i].tagName.toLowerCase() === 'h2' && $headings[i - 1].tagName.toLowerCase() === 'h2') {
                content += "</li><li class=\"edugouv-summary-item-group\">".concat(link);
              }
              if ($headings[i].tagName.toLowerCase() !== 'h2' && $headings[i - 1].tagName.toLowerCase() === 'h2') {
                content += "<ul><li>".concat(link);
              }
              if ($headings[i].tagName.toLowerCase() !== 'h2' && $headings[i - 1].tagName.toLowerCase() !== 'h2') {
                content += "</li><li>".concat(link);
              }
              if ($headings[i].tagName.toLowerCase() === 'h2' && $headings[i - 1].tagName.toLowerCase() !== 'h2') {
                content += "</ul><li class=\"edugouv-summary-item-group\">".concat(link);
              }
            } else {
              content += "<li class=\"edugouv-summary-item-group\">".concat(link);
            }
            if ($headings.length - 1 === i) {
              content += '</li></ul>';
            }
          });
          $summary.find('.overview').append(content);

          // Set summary height and init tinyscrollbar.
          scrollWrapper.append('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>');
          var summary = $(element).find('.edugouv-progress-summary .overview');
          var summaryGroup = summary.find('.edugouv-summary-item-group');
          summaryGroup.addClass('active');
          summaryGroup.children().addClass('active');
          var viewportHeight = $(window).height() - $('.header').height() - $('.edugouv-progress-bar').height();
          viewportHeight -= $('.tarteaucitronAlertBigBottom').css('display') == 'block' ? $('.tarteaucitronAlertBigBottom').outerHeight() : 0;
          viewportHeight -= $('.mini-site-menu-wrapper').length ? $('.mini-site-menu-wrapper').height() : 0;
          viewportHeight -= $('#toolbar-administration').length ? 80 : 0;
          var margin = summary.outerHeight() > 0 ? 20 : 0;
          scrollWrapper.css('margin-top', margin);
          setTimeout(function () {
            if (summary.outerHeight() + margin > viewportHeight) {
              scrollWrapper.css('height', viewportHeight + 'px');
              summary.find('.edugouv-summary-item-group').removeClass('active');
              summary.find('.edugouv-summary-item-group').children().removeClass('active');
              // Create custom scrollbar.
              scrollWrapper.tinyscrollbar({
                axis: 'y'
              });
            } else {
              scrollWrapper.find('.scrollbar').hide();
              summary.find('.edugouv-summary-item-group').not(':first-child').removeClass('active');
              summary.find('.edugouv-summary-item-group').children().removeClass('active');
              scrollWrapper.css('height', summary.outerHeight() + margin + 'px');
              summary.find('.edugouv-summary-item-group').removeClass('active');
            }
          }, 100);
          var $summaryItem = $('a', $summary);
          $summaryItem.click(function (e) {
            e.preventDefault();
            new Promise(function (resolve) {
              var $element = $($(e.currentTarget).attr('href'));
              if ($element.length) {
                $element.triggerHandler('summary:open');
                setTimeout(function () {
                  return resolve();
                }, 250);
              } else {
                resolve();
              }
            }).then(function () {
              $('html, body').animate({
                scrollTop: $(e.target.attributes.href.value).offset().top - currentGapHeight()
                // scrollTop: $($(e.currentTarget).attr('href')).offset().top - $header.outerHeight() - parseInt($header.css('top'), 10),
              }, 500);
            });
            if (scrollWrapper.data('plugin_tinyscrollbar') !== undefined) {
              refreshTinyScroll();
            }
          });
          highlightSummary($headings, $summaryItem);
          $window.scroll(function () {
            highlightSummary($headings, $summaryItem);
            if (scrollWrapper.data('plugin_tinyscrollbar') !== undefined
            // && !scrollWrapper.find('.scrollbar').hasClass('disable')
            ) {
              refreshTinyScroll();
              var scroll = scrollWrapper.data('plugin_tinyscrollbar');
              var scrolltop = 0;
              var groupsArray = $('.edugouv-summary-item-group.active').prevAll('.edugouv-summary-item-group');
              for (var groupInd = 0; groupInd < groupsArray.length; groupInd++) {
                scrolltop += groupsArray.eq(groupInd).outerHeight() + parseInt(groupsArray.eq(groupInd).css('margin-bottom'), 10);
              }
              if (scroll.contentPosition !== scrolltop) {
                scrollWrapper.data('plugin_tinyscrollbar').update(scrolltop);
              }
            }
          });
        }
      });
    }
  };

  /**
   * Accessibility button.
   */
  Drupal.behaviors.accessibilityButton = {
    attach: function attach() {
      $(document).on('click', 'input[name="tandem-ac-contrast"]', function () {
        var $accessibilityButton = $('#tandem-ac-button');
        var $body = $('body');
        if ($body.hasClass('tandem-ac-high-contrast')) {
          $accessibilityButton.html('<span aria-hidden="true"></span>Renforced');
        } else {
          $accessibilityButton.html('<span aria-hidden="true"></span>Accessibility');
        }
      });
    }
  };

  /**
   * Create popup with image.
   */
  Drupal.behaviors.edugouvModal = {
    attach: function attach(context) {
      $('[data-edugouv-modal], .js-gallery .lazy', context).once('edugouvModal').each(function (index, element) {
        var $this = $(element);
        var popupOpened = false;
        var $attribute;
        if ($this.attr('data-edugouv-modal')) {
          $attribute = 'data-edugouv-modal';
          setPopup($attribute);
        } else if ($this.hasClass('lazy')) {
          $this.Lazy({
            scrollDirection: 'vertical',
            visibleOnly: true,
            beforeLoad: function beforeLoad(element) {
              $this.closest('.gallery-slider').addClass('loading');
            },
            afterLoad: function afterLoad(element) {
              $attribute = 'src';
              setPopup($attribute);
              $this.closest('.gallery-slider').removeClass('loading');
            }
          });
        }
        function setPopup(attrValue) {
          var $img = $this.attr(attrValue).includes('/');
          var content = '';
          if ($img) {
            content = "<img src=\"".concat($this.attr(attrValue), "\" alt=\"").concat($this.attr('alt'), " - ").concat(Drupal.t('Enlarged image'), "\">");
          } else {
            content = $($this.attr(attrValue)).html();
          }
          var $popup = $(Drupal.theme('edugouvPopup', "".concat(content)));
          var $body = $('body');
          var $html = $('html');
          if ($img && !$this.hasClass('no-wrap')) {
            $this.wrap('<div class="edugouv-modal-item-wrapper"></div>');
            $this.attr('tabindex', 0);
            $this.before("<div class=\"edugouv-modal-icon\">".concat(Drupal.t('Enlarge infographic'), "</div>"));
            $this.after('<span class="edugouv-modal-icon__focuser"></span>');
          }
          $body.on('edugouv-modal-close', function () {
            popupOpened = false;
            $html.removeClass('disable-scroll');
            $('.edugouv-popup').remove();
            $(document).off('click', '.edugouv-popup__arrows .prev-gallery');
            $(document).off('click', '.edugouv-popup__arrows .next-gallery');
          });
          $(document).keyup(function (e) {
            if (e.key === 'Escape') {
              $body.trigger('edugouv-modal-close');
            }
          });
          $this.on('click keypress', function (event) {
            event.preventDefault();
            if (!$body.hasClass('a42-ac-high-contrast')) {
              var $clonedPopup = $popup.clone().appendTo($body);
              var $closeButton = $('.edugouv-popup__close', $clonedPopup);
              $html.addClass('disable-scroll');
              Drupal.attachBehaviors(document, Drupal.settings);
              if ($this.closest('.js-gallery').length && !$('.edugouv-popup__arrows').length) {
                $('.edugouv-popup__wrapper').append('<div class="edugouv-popup__arrows"><a class="prev-gallery"></a><a class="next-gallery"></a></div>');
              } else if (!$this.closest('.js-gallery').length) {
                $('.edugouv-popup__wrapper .edugouv-popup__arrows').remove();
              }
              $closeButton.focus();
              $(document).one('click', '.edugouv-popup__arrows .prev-gallery', function () {
                $body.trigger('edugouv-modal-close');
                $this.closest('.gallery-slider').prev().find('img.call-popup-modal').trigger('click');
              });
              $(document).one('click', '.edugouv-popup__arrows .next-gallery', function () {
                $body.trigger('edugouv-modal-close');
                $this.closest('.gallery-slider').next().find('img.call-popup-modal').trigger('click');
              });
              $clonedPopup.click(function (e) {
                if (!$clonedPopup.find(e.target).length && !$(e.target).hasClass('tarteaucitronAllow') || $clonedPopup.find(e.target).hasClass('edugouv-popup__wrapper')) {
                  $body.trigger('edugouv-modal-close');
                }
              });
              $closeButton.click(function (e) {
                e.preventDefault();
                $body.trigger('edugouv-modal-close');
              });
            }
          });
        }
      });
    }
  };

  /**
   * Create share popup.
   */
  Drupal.behaviors.edugouvSharePopup = {
    attach: function attach(context) {
      var _this = this;
      $('.js-share', context).once('edugouvSharePopup').each(function (index, element) {
        var $this = $(element);
        var $link = $('button', $this).length ? $('button', $this) : $('a', $this);
        var $closeButton = $('.share__items__close', $this);
        var popupSubtitleText = $('.header__title').text().trim();
        var popupSubTitle = "<p id=\"share_subtitle\" class=\"subtitle\">".concat(popupSubtitleText, "</p>");
        var $sharePopup = $(element).find('.share__items');
        setTimeout(function () {
          $('.addthis-box', $this).before(popupSubTitle);
          $sharePopup.find('.subtitle').attr('id', "".concat($sharePopup.find('.subtitle').attr('id') + index));
          $sharePopup.find('h1').attr('id', "".concat($sharePopup.find('h1').attr('id') + index));
          var popupDescribedby = $sharePopup.find('.subtitle').attr('id');
          var popupLabelledby = $sharePopup.find('h1').attr('id');
          $sharePopup.attr('aria-describedby', popupDescribedby);
          $sharePopup.attr('aria-labelledby', popupLabelledby);
        }, 100);
        $sharePopup.each(function () {
          var $name = $(_this).find('h1').text();
          $(_this).attr('name', $name);
        });
        $link.click(function (e) {
          e.preventDefault();
          $(document).find('.js-share.show-popup').removeClass('show-popup');
          $this.addClass('show-popup');
        });
        $closeButton.click(function () {
          $this.removeClass('show-popup');
        });
        $('body').click(function (e) {
          var $target = $(e.target);
          if (!$target.closest('.js-share').length) {
            $this.removeClass('show-popup');
          }
        });
        $(document).keyup(function (e) {
          if (e.key === 'Escape') {
            $('.js-share.show-popup > button').first().focus();
            $this.removeClass('show-popup');
          }
        });
        $(document).on('keydown', '.share__items a, .share__items button', function (e) {
          var code = e.keyCode || e.which;
          var $tabButton = code === 9;
          var $shiftButton = e.shiftKey;
          var $popupWrapper = $(e.target).closest('.share__items');
          var $openPopup = $(e.target).closest('.js-share').hasClass('show-popup');
          var $links = $popupWrapper.find('a, button');
          if ($tabButton && $openPopup) {
            if (!$shiftButton && $(e.target)[0] === $links.last()[0]) {
              e.preventDefault();
              $popupWrapper.find('button:first-child').focus();
            }
            if ($shiftButton && $(e.target)[0] === $links.first()[0]) {
              e.preventDefault();
              $popupWrapper.find('a:last-child').focus();
            }
          }
        });
      });
    }
  };

  /**
   * Create responsive table.
   */
  Drupal.behaviors.edugouvTable = {
    attach: function attach(context) {
      $('.ckeditor-text table, .maintenance-page table', context).once('edugouvTable').each(function (index, element) {
        if ($(element).parents('table').length) {
          return;
        }
        var $this = $(element);
        $this.wrap('<div class="table-wrapper custom-scrollbar-wrapper"><div class="viewport"><div class="overview"></div></div></div>');
        var $tableWrapper = $this.parents('.table-wrapper');
        $tableWrapper.append('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>');
        $this.find('tr').each(function (i, e) {
          $(e).find('*').first().addClass('first-item');
        });
        function setSize() {
          $tableWrapper.find('.viewport').height($this[0].offsetHeight);
        }
        setSize();

        // Create custom scrollbar.
        $tableWrapper.tinyscrollbar({
          axis: 'x',
          wheel: true
        });
        $(window).resize(function () {
          setSize();
          $tableWrapper.data('plugin_tinyscrollbar').update();
        });
        if ($this.closest('.faq-section__accordion').length) {
          $('body').on('click', '.faq-section__accordion .faqfield-question', function (e) {
            $tableWrapper.find('.viewport').height($this[0].offsetHeight);
            $tableWrapper.data('plugin_tinyscrollbar').update();
          });
        }
      });
    }
  };

  // Hotfix for https://prj.adyax.com/issues/394169
  Drupal.behaviors.modalInput = {
    attach: function attach() {
      $(document).ajaxComplete(function () {
        setTimeout(function () {
          $('.cke_button__anchor').click(function () {
            setTimeout(function () {
              $('input').once('modalInput').each(function (index, element) {
                $(element).click(function (e) {
                  $(e.target).focus();
                });
              });
            }, 100);
          });
        }, 1000);
      });
    }
  };

  /**
   * Returns html of progress bar.
   */
  Drupal.theme.edugouvProgressBar = function () {
    return '<div class="edugouv-progress-bar"><span class="progress"></span></div>';
  };

  /**
   * Returns html of popup.
   */
  Drupal.theme.edugouvPopup = function (content) {
    var output = '';
    output += '<div class="edugouv-popup">';
    output += '<div class="edugouv-popup__wrapper">';
    output += '<div class="edugouv-popup__content">';
    output += "<a aria-label=\"".concat(Drupal.t('Close popup'), "\" href=\"#\" class=\"edugouv-popup__close\"></a>");
    output += content;
    output += '</div>';
    output += '</div>';
    output += '</div>';
    return output;
  };

  /**
   * Sets width of autocomplete field same to input; mobile search scroll to top on focus
   */
  Drupal.behaviors.edugouvSearchAutocomplete = {
    attach: function attach(context) {
      var _this2 = this;
      $('.header__search__form', context).once('edugouvSearchAutocomplete').each(function (index, element) {
        var $this = $(element);
        if ($this.closest('.glossary__header').length === 0) {
          var $form = $('form', $this);
          var $input = $('.ui-autocomplete-input', $this);
          var $autocomplete = $('.ui-autocomplete');
          var $searchSubmit = $('.form-submit', $this);
          var $returnButton = $('.return-button', $this);

          // Autocomplete width equals to search input.
          $input.on('input', function () {
            var $inputWidth = $input.outerWidth();
            $autocomplete.css('max-width', $inputWidth);
          });

          // Prevent search submit if empty input.
          $form.submit(function (e) {
            if ($input.val().length < 1) {
              e.preventDefault();
            }
          });

          // Submit on click
          if ($input.length) {
            $input.autocomplete({
              select: function select(e, ui) {
                $(_this2).val(ui.item.value);
                if (ui.item.label.indexOf('_blank') >= 0) {
                  var link = jQuery.parseHTML(ui.item.label);
                  var win = window.open(link[0].href, '_blank');
                  win.focus();
                } else if (ui.item.label.indexOf('href="/') >= 0) {
                  var _link = jQuery.parseHTML(ui.item.label);
                  window.location.href = _link[0].href;
                  return false;
                }
                return $form.submit();
              }
            });
          }

          // Mobile behavior.
          var searchScroll = function searchScroll(mq) {
            if (mq.matches) {
              $input.on('focusin', function () {
                var $inputHeight = $input.outerHeight();
                $searchSubmit.css('max-height', $inputHeight);
                $('html, body').animate({
                  scrollTop: $input.offset().top - 100
                }, 500);
                $form.addClass('focused');
                $returnButton.addClass('displayed');
              });
              $input.on('focusout', function () {
                $form.removeClass('focused');
                $returnButton.removeClass('displayed');
              });
            }
          };
          var mq = window.matchMedia('(max-width: 767px)');
          mq.addListener(searchScroll);
          searchScroll(mq);
        }
      });
    }
  };

  /**
   * Change behavior of preloader spinner
   */
  Drupal.behaviors.loadSpinner = {
    attach: function attach() {
      var _this3 = this;
      var $link = $('button.personality-contents-block-load-more');
      var $container = $('.personality-content-wrapper div.personality-contents-block-load-more');
      var $newsContainer = $('.show-more-personality-content-wrapper');
      var $newsLink = $newsContainer.find('.show-more-personality-content');
      $link.click(function (event) {
        event.preventDefault();
        var $currentButton = $(_this3);
        $container.addClass('loading');
        $(document).ajaxComplete(function () {
          $container.removeClass('loading');
          $currentButton.remove();
        });
      });
      $newsLink.click(function (event) {
        event.preventDefault();
        var $currentButton = $(_this3);
        $newsContainer.addClass('loading');
        $(document).ajaxComplete(function () {
          $newsContainer.removeClass('loading');
          $currentButton.remove();
        });
      });
    }
  };

  /**
   * Change behavior of anchor links
   */
  Drupal.behaviors.anchorLinks = {
    attach: function attach() {
      var _this4 = this;
      var $anchorLinks = $('.article__main .column--flex--main a[href^="#"]');
      $anchorLinks.each(function () {
        $(_this4).click(function () {
          var id = $(_this4).attr('href');
          var $header = $('.header');
          var headerTop = parseInt($header.css('top'), 10) + $header.outerHeight();
          var elemTop = $(id).offset().top;
          $('html, body').animate({
            scrollTop: elemTop - headerTop
          }, 500);
        });
      });
    }
  };

  /**
   * Add behavior of facet show more button
   */
  Drupal.behaviors.facetShowMore = {
    attach: function attach() {
      if ($('.facets-widget-links').length) {
        $('.facets-widget-links').each(function (index, element) {
          var tagsCount = $(element).children('.js-facets-links').find('.facet-item').length;
          if (tagsCount > 7) {
            $(element).children('.js-facets-links').find('.facet-item:nth-child(7)').nextAll().hide();
            if (!$(element).find('.facet-item-show').length) {
              $(element).children('.js-facets-links').append("<li class=\"facet-item-show\"><button type=\"button\" class=\"btn btn-cta btn-light-blue show-all-tags\">".concat(Drupal.t('Show more thematics'), "</button></li>"));
            }
            $('.facet-item-show').show();
          }
        });
        $('.show-all-tags').off().on('click', function (e) {
          e.preventDefault();
          $(e.target).toggleClass('all-shown');
          if ($(e.target).hasClass('all-shown')) {
            $(e.target).text(Drupal.t('Hide thematics'));
            $(e.target).closest('.js-facets-links').find('.facet-item').show();
          } else {
            $(e.target).text(Drupal.t('Show more thematics'));
            $(e.target).closest('.js-facets-links').find('.facet-item:nth-child(7)').nextAll().hide();
          }
          $('.facet-item-show').show();
        });
      }
    }
  };

  /**
   * Add behavior to change bio header icon
   */
  Drupal.behaviors.changeBioHeader = {
    attach: function attach(context) {
      $('.header__related', context).once('changeBioHeader').each(function (index, element) {
        $(element).find('a').prepend('<span class="pseudo-content" aria-hidden="true"></span>');
      });
    }
  };

  /**
   * Add behavior to add class to colored block
   */
  Drupal.behaviors.changeColoredBlock = {
    attach: function attach(context) {
      $('.ckeditor-background-color', context).once('changeColoredBlock').each(function (index, element) {
        var color = $(element).css('background-color');
        var rgb = color.substr(4).split(")")[0].split(', ');
        if (parseInt(rgb[0]) < 230 || parseInt(rgb[1]) < 230 || parseInt(rgb[2]) < 230) {
          $(element).addClass('colored');
        }
        if (parseInt(rgb[0]) === 0 || parseInt(rgb[1]) === 0 || parseInt(rgb[2]) === 0) {
          $(element).addClass('colored-black');
        }
      });
    }
  };

  /**
   * Add behavior to add class to white CTA
   */
  Drupal.behaviors.changeColoredCta = {
    attach: function attach(context) {
      $('.ctalink', context).once('changeColoredCta').each(function (index, element) {
        var color = $(element).css('background-color');
        var rgb = color.substr(4).split(')')[0].split(', ');
        if (parseInt(rgb[0], 10) > 230 || parseInt(rgb[1], 10) > 230 || parseInt(rgb[2], 10) > 230) {
          $(element).addClass('ctalink-white');
        }
      });
    }
  };
  Drupal.behaviors.searchPageRadiosBehavior = {
    attach: function attach(context) {
      $('.edugouv-search-type', context).once('searchPageRadiosBehavior').each(function (index, element) {
        var elements = $(element).find('.form-item-radio');
        elements.each(function () {
          var label = $(this).find('label');
          label.on('keyup', function (e) {
            if (e.key === 'Enter') {
              label.siblings('input').trigger('click');
            }
          });
        });
      });
    }
  };
  Drupal.behaviors.scrollOnEspacePressChange = {
    attach: function attach(context) {
      $('.ep-srch-form-container__form', context).once('scrollOnEspacePressChange').each(function (index, element) {
        var $header = $('.header');
        var inputs = $(element).find('.js-form-type-checkbox input');
        var dateInputs = $(element).find('.ep-srch-form__dates .form-item input');
        var resetForm = $(element).find('.ep-srch-form__btn');
        var getNeededPosition = function getNeededPosition() {
          var elemTop = $(element).closest('.container--flex').find('.column--flex--main--wide').offset().top;
          var headerTop = parseInt($header.css('top'), 10) + $header.outerHeight();
          return elemTop - headerTop;
        };
        function applyScroll() {
          $('html, body').animate({
            scrollTop: getNeededPosition() - 10
          }, 500);
        }
        dateInputs.each(function () {
          $(this).on('change', function () {
            applyScroll();
          });
        });
        inputs.each(function () {
          $(this).on('change', function () {
            applyScroll();
          });
        });
        resetForm.on('click', function () {
          applyScroll();
        });
        $(document).ajaxComplete(function () {
          if (!$(element)) {
            return false;
          }
          applyScroll();
        });
      });
    }
  };
  Drupal.behaviors.aushaFrameTrackingClass = {
    attach: function attach(context) {
      $('body', context).once('aushaFrameTrackingClass').each(function (index, element) {
        var frames = $('iframe', element);
        frames.each(function (i, el) {
          var src = el.getAttribute('src');
          if (src.includes('ausha')) {
            el.closest('.embedded-entity').classList.add('tandem-media-wrapper-ausha');
          }
        });
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
"use strict";

(function ($, Drupal) {
  function onPagerClick() {
    var $listContainer = $('article.espace_press .column--flex--main--wide');
    if ($listContainer.length) {
      $('html, body').animate({
        scrollTop: $listContainer.offset().top - 120
      }, 500);
    }
  }
  Drupal.behaviors.espacePressPager = {
    attach: function attach() {
      var $pagerItems = $('article.espace_press .pager a');
      $pagerItems.off('click.espacePressPager');
      $pagerItems.on('click.espacePressPager', onPagerClick);
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  Drupal.behaviors.etablissementSearch = {
    attach: function attach(context) {
      $('.js-establishment__search', context).once('etablissementSearch').each(function (index, element) {
        var $this = $(element);
        var $searchField = $('.js-form-type-textfield', $this);
        var $removeFilterButton = $('.etablissement--search__content__header_tags .btn');
        // const checkedItems = `(${$('[type="checkbox"]:checked,[type="radio"]:checked').length})`;
        var basePath = drupalSettings.path ? drupalSettings.path.baseUrl : '/';
        var pathname = window.location.pathname + window.location.search;
        $searchField.append("\n          <div class=\"form-actions\">\n            <button type=\"submit\">Search</button>\n          </div>\n        ");
        // Hide for now.
        // <div class="geolocation">
        // <a aria-label="${Drupal.t('Geolocation')}" href="javascript:void(0);"></a>
        // </div>
        // `);
        $('fieldset, .form-actions.js-form-wrapper').wrapAll('<div class="filters__content" id="filtersContent"></div>');
        $('.filters__content').prepend('<p>Affinez votre recherche</p>');
        $('.filters__content').wrap('<div class="filters"></div>');
        $('.filters').after("<button class=\"open-map\">".concat(Drupal.t('Search by map'), "</button>"));
        var openMap = $('.open-map');
        $('#edit-field-properties :input').each(function (item, inputElement) {
          if (!$(inputElement).prop('checked')) {
            $(".tag-".concat($(inputElement).prop('value'))).each(function (itemTag, tagElement) {
              $(tagElement).hide();
            });
          }
        });
        $removeFilterButton.on('click', function (e) {
          var removeID = $(e.target).attr('id');
          if (removeID === 'radio-field-status') {
            $('#edit-field-status').find('input[value="All"]').prop('checked', true);
            $this.find('form').submit();
          } else if (removeID === 'radio-field-type') {
            $('#edit-field-type-etablissement').find('input[value="All"]').prop('checked', true);
            $this.find('form').submit();
          } else if (removeID === 'radio-field-geo') {
            $('#edit-geo-point').val('');
            $this.find('form').submit();
          } else {
            var checkboxId = removeID.split('status-').pop();
            $("[name*=\"".concat(checkboxId, "\"]")).prop('checked', false);
            $this.find('form').submit();
          }
        });
        if ($('.js-map-search').length) {
          var map = L.map('map').setView([46, 2], 6);
          $.get("".concat(basePath, "map").concat(pathname)).done(function (responce) {
            $('.js-map-search').once('searchMap').each(function () {
              var mapCopyright = drupalSettings.osm_credit !== undefined ? jQuery.parseHTML(drupalSettings.osm_credit) : [''];
              map.attributionControl.setPrefix(false);
              if (mapCopyright.length) {
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: mapCopyright[0].innerHTML
                }).addTo(map);
              } else {
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
              }
              $.each(responce.academy, function (i, val) {
                var lat = val.latitude;
                var lon = val.longitude;
                var count = val.count;
                var mapIcon = L.divIcon({
                  html: "<div class=\"icon-map\">".concat(count, "</div>"),
                  iconSize: null
                });
                if (lat !== undefined && lon !== undefined) {
                  L.marker([lat, lon], {
                    icon: mapIcon
                  }).addTo(map);
                }
              });
              openMap.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $('.js-map-search').show();
                map.invalidateSize();
              });
              $('.close-map').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $('.js-map-search').hide();
              });
            });
          });
        }
        $this.closest('body').find('.footer-nav').addClass('footer-nav--establishment__search');
        $this.closest('body').find('.footer-nav').addClass('footer-nav--establishment__search');

        // Hide for now.
        // $('.geolocation a').on('click', (e) => {
        //   e.preventDefault();
        //   e.stopPropagation();
        //   navigator.geolocation.getCurrentPosition((position) => {
        //     const lat = position.coords.latitude;
        //     const lng = position.coords.longitude;
        //     const latLng = `${lat},${lng}`;
        //     $('#edit-geo-point').val(latLng);
        //     $this.find('form').submit();
        //   });
        // });
      });
    }
  };
  /**
  * Add behavior to scroll to search filters
  */
  Drupal.behaviors.scrollToSearchFilters = {
    attach: function attach(context) {
      $('[data-drupal-selector="edit-keywords"]', context).once('scrollToSearchFilters').each(function (index, element) {
        var scrollTop = 0;
        if ($('.js-establishment__search').length) {
          var _window = window,
            location = _window.location;
          if (location.search.length) {
            scrollTop = $('.establishment__search__header').offset().top + $('.establishment__search__header').innerHeight() - 100;
          } else {
            scrollTop = $('.establishment__search__header').offset().top - 100;
          }
        } else {
          scrollTop = $(element).offset().top + $(element).outerHeight() - 100;
        }
        if ($('#toolbar-administration').length) {
          scrollTop -= 170;
        }
        $('html, body').animate({
          scrollTop: scrollTop
        }, 500);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create glossary filters.
   */
  Drupal.behaviors.edugouvGlossaryFilters = {
    attach: function attach(context) {
      $('.glossary__filters', context).once('edugouvGlossaryFilters').each(function (index, element) {
        var $this = $(element);
        var $filterTrigger = $('a', $this);
        var $glossaryLetter = $('.glossary__letter').not('#wrapper-letter-none');
        var noResultsBlock = $('#wrapper-letter-none');
        $filterTrigger.click(function (e) {
          e.preventDefault();
          e.stopPropagation();
          $filterTrigger.not(e.target).removeClass('is-active');
          $(e.target).toggleClass('is-active');
          if ($filterTrigger.hasClass('is-active')) {
            $glossaryLetter.each(function (i, el) {
              var parentFilter = $("a[href=\"#".concat($(el).attr('id'), "\"]"), $this);
              if (!parentFilter.hasClass('is-active')) {
                $(el).fadeOut().removeClass('visible');
              } else if (!$(el).hasClass('hide')) {
                $(el).fadeIn().addClass('visible');
              }
            });
          } else if (!$glossaryLetter.hasClass('hide')) {
            $glossaryLetter.fadeIn().addClass('visible');
          }
          if (!$('.glossary__letter.visible').length) {
            noResultsBlock.show().removeClass('hide');
          } else {
            noResultsBlock.hide().addClass('hide');
          }
        });
      });
    }
  };

  /**
   * Create glossary search.
   */
  Drupal.behaviors.edugouvSearch = {
    attach: function attach(context) {
      $('#glossarySearch', context).once('edugouvGlossaryFilters').each(function (index, element) {
        var $this = $(element);
        var glossaryItem = $('.glossary__item');
        var noResultsMessage = $('#wrapper-letter-none');
        noResultsMessage.hide().addClass('hide');
        $this.submit(function (e) {
          var counter = 0;
          e.preventDefault();
          var filter = $('input[type="text"]', $this).val().toUpperCase();
          glossaryItem.each(function (i, el) {
            var textValue = $(el).text();
            if (textValue.toUpperCase().indexOf(filter) > -1) {
              $(el).show().removeClass('hide');
              $(el).parent().show().removeClass('hide');
              counter += 1;
            } else {
              $(el).hide().addClass('hide');
              if ($(el).parent().find('.glossary__item').length === $(el).parent().find('.hide').length) {
                $(el).parent().hide().addClass('hide');
              } else {
                $(el).parent().show().removeClass('hide');
              }
            }
          });
          if (counter === 0) {
            noResultsMessage.show().removeClass('hide');
          } else {
            noResultsMessage.hide().addClass('hide');
          }
        });
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
  * Add behavior to scroll to search ival filters
  */
  Drupal.behaviors.scrollToIvalFilters = {
    attach: function attach(context) {
      $('.ival-search', context).once('scrollToIvalFilters').each(function (index, element) {
        var scrollTop = 0;
        if ($('.etablissement--search__content__wrapper').length) {
          scrollTop = $(element).find('.establishment__search__header__content').offset().top + jQuery('.establishment__search__header__content').innerHeight() - 250;
        } else {
          scrollTop = $(element).find('.establishment__search__header__content').offset().top - 150;
        }
        $('html, body').animate({
          scrollTop: scrollTop
        }, 500);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
(function ($, Drupal) {
  Drupal.behaviors.servicePage = {
    attach: function attach(context) {
      var _this = this;
      $('.js-block-services', context).once('servicePage').each(function (index, element) {
        var $element = $(element);
        var render = function render(elements) {
          var elementsNodes = Object.entries(elements.nodes).map(function (e) {
            return _defineProperty({}, e[0], e[1]);
          });
          var $tabContent1 = $('.tab-services-1', $element);
          var $tabContent2 = $('.tab-services-2', $element);
          var $tagsList1 = $('.tags-list1', $element);
          var $tagsList2 = $('.tags-list2', $element);
          var $highlighted1 = $('.highlighted', $tabContent1);
          var $list1 = $('.list', $tabContent1);
          var $highlighted2 = $('.highlighted', $tabContent2);
          var $list2 = $('.list', $tabContent2);
          var $searchFormTab1 = $('#search-form-tab-1');
          var $searchFormTab2 = $('#search-form-tab-2');
          var $searchInput1 = $('input', $searchFormTab1);
          var $searchInput2 = $('input', $searchFormTab2);
          var count1 = $('.count', $tabContent1);
          var count2 = $('.count', $tabContent2);
          var noData1 = $('.no-data', $tabContent1);
          var noData2 = $('.no-data', $tabContent2);
          var itemOfServices;
          var array1 = [];
          var array2 = [];
          var filtersTab1 = [];
          var filtersTab2 = [];
          var regEx = /[\.,:;+]/g;
          var checkLength = function checkLength(elem) {
            if (elem.children().length === 0 || elem.children().length === elem.children('.out').length) {
              elem.parent().css('display', 'none');
            } else {
              elem.parent().css('display', 'block');
            }
          };
          var selectedItems = drupalSettings.selected_services;
          var highlightedItems = drupalSettings.highlighted_services;
          var arrayOfIds = [];
          var arrayOfHighlighted = [];
          selectedItems.forEach(function (selectedItem) {
            arrayOfIds.push(selectedItem.target_id);
          });
          if (highlightedItems) {
            highlightedItems.forEach(function (highlightedItem) {
              arrayOfHighlighted.push(highlightedItem.target_id);
              arrayOfIds.push(highlightedItem.target_id);
            });
          }
          elementsNodes.forEach(function (item, i) {
            Object.keys(item).forEach(function (prop) {
              var tagsData = [];
              itemOfServices = {};
              itemOfServices.category = item[prop].category;
              itemOfServices.title = item[prop].name.trim();
              itemOfServices.tag = item[prop].sub_categories;
              itemOfServices.img = item[prop].picture;
              itemOfServices.description = item[prop].description;
              itemOfServices.highlighted = item[prop].highlighted;
              itemOfServices.link = item[prop].link;
              itemOfServices.id = item[prop].id;
              itemOfServices.share_block = item[prop].share_block;
              itemOfServices.tag.forEach(function (elem, inx) {
                tagsData.push(elem.replace(/\s/g, '-'));
              });
              itemOfServices.dataTags = tagsData;
              if (arrayOfIds.includes(itemOfServices.id) || arrayOfHighlighted.includes(itemOfServices.id)) {
                if (itemOfServices.category.includes('parents_and_students') && itemOfServices.category.includes('education_professionals')) {
                  array1.push(itemOfServices);
                  array2.push(itemOfServices);
                } else if (itemOfServices.category.includes('parents_and_students')) {
                  array1.push(itemOfServices);
                } else {
                  array2.push(itemOfServices);
                }
              }
            });
          });
          var sortedHighlightedItems = [];
          arrayOfHighlighted.forEach(function (itemId) {
            array1.forEach(function (arrItem) {
              if (itemId === arrItem.id) {
                sortedHighlightedItems.push(arrItem);
              }
            });
          });
          sortedHighlightedItems.forEach(function (item) {
            var descriptionClass = '';
            var itemDataDescription = item.description;
            var itemDataTitle = item.title;
            var itemDataTags = item.dataTags;
            if (itemDataDescription === '') {
              descriptionClass = 'no-description';
            }
            $("<article class=\"block-item ".concat(arrayOfIds.includes(item.id) ? 'not-hidden' : 'hidden', " ").concat(descriptionClass, "\" data-description=\"").concat(itemDataDescription, "\" data-title=\"").concat(itemDataTitle, "\" data-tag=\"").concat(itemDataTags.join(' '), "\">").concat(Drupal.theme('renderElements', item), "</article>")).appendTo($highlighted1);
          });
          array1.forEach(function (item, i) {
            var $item = item;
            var itemTag = $item.tag;
            var itemDataTags = $item.dataTags;
            var itemDataDescription = $item.description;
            var itemDataTitle = $item.title;
            var descriptionClass = '';
            filtersTab1.push(itemTag);
            if (itemDataDescription === '') {
              descriptionClass = 'no-description';
            }

            // $(`<article class="block-item ${ arrayOfIds.includes($item.id) ? 'not-hidden' : 'hidden'} ${descriptionClass}" data-description="${itemDataDescription}" data-title="${itemDataTitle}" data-tag="${itemDataTags.join(' ')}">${Drupal.theme('renderElements', $item)}</article>`).appendTo($list1);
            //
            // if ($item.highlighted === '1' && arrayOfIds.includes($item.id)) {
            //   $(`<article class="block-item ${ arrayOfIds.includes($item.id) ? 'not-hidden' : 'hidden'} ${descriptionClass}" data-description="${itemDataDescription}" data-title="${itemDataTitle}" data-tag="${itemDataTags.join(' ')}">${Drupal.theme('renderElements', $item)}</article>`).appendTo($highlighted1);
            // }

            $("<article class=\"block-item ".concat(arrayOfIds.includes($item.id) ? 'not-hidden' : 'hidden', " ").concat(descriptionClass, "\" data-description=\"").concat(itemDataDescription, "\" data-title=\"").concat(itemDataTitle, "\" data-tag=\"").concat(itemDataTags.join(' '), "\">").concat(Drupal.theme('renderElements', $item), "</article>")).appendTo($list1);
            //
            // if (arrayOfHighlighted.length) {
            //   if (arrayOfHighlighted.includes($item.id)) {
            //     $(`<article class="block-item ${ arrayOfIds.includes($item.id) ? 'not-hidden' : 'hidden'} ${descriptionClass}" data-description="${itemDataDescription}" data-title="${itemDataTitle}" data-tag="${itemDataTags.join(' ')}">${Drupal.theme('renderElements', $item)}</article>`).appendTo($highlighted1);
            //   }
            // }
          });

          var sortedHighlightedItems2 = [];
          arrayOfHighlighted.forEach(function (itemId) {
            array2.forEach(function (arrItem) {
              if (itemId === arrItem.id) {
                sortedHighlightedItems2.push(arrItem);
              }
            });
          });
          sortedHighlightedItems2.forEach(function (item) {
            var descriptionClass = '';
            var itemDataDescription = item.description;
            var itemDataTitle = item.title;
            var itemDataTags = item.dataTags;
            if (itemDataDescription === '') {
              descriptionClass = 'no-description';
            }
            $("<article class=\"block-item ".concat(arrayOfIds.includes(item.id) ? 'not-hidden' : 'hidden', " ").concat(descriptionClass, "\" data-description=\"").concat(itemDataDescription, "\" data-title=\"").concat(itemDataTitle, "\" data-tag=\"").concat(itemDataTags.join(' '), "\">").concat(Drupal.theme('renderElements', item), "</article>")).appendTo($highlighted2);
          });
          array2.forEach(function (item, i) {
            var $item = item;
            var itemTag = $item.tag;
            var itemDataTags = $item.dataTags;
            var itemDataDescription = $item.description;
            var itemDataTitle = $item.title;
            var descriptionClass = '';
            filtersTab2.push(itemTag);
            if (itemDataDescription === '') {
              descriptionClass = 'no-description';
            }
            $("<article class=\"block-item ".concat(arrayOfIds.includes($item.id) ? 'not-hidden' : 'hidden', " ").concat(descriptionClass, "\" data-description=\"").concat(itemDataDescription, "\" data-title=\"").concat(itemDataTitle, "\" data-tag=\"").concat(itemDataTags.join(' '), "\">").concat(Drupal.theme('renderElements', $item), "</article>")).appendTo($list2);
            //
            // if (arrayOfHighlighted.length) {
            //   if (arrayOfHighlighted.includes($item.id)) {
            //     $(`<article class="block-item ${arrayOfIds.includes($item.id) ? 'not-hidden' : 'hidden'} ${descriptionClass}" data-description="${itemDataDescription}" data-title="${itemDataTitle}" data-tag="${itemDataTags.join(' ')}">${Drupal.theme('renderElements', $item)}</article>`).appendTo($highlighted2);
            //   }
            // }
          });

          filtersTab1 = filtersTab1.reduce(function (a, b) {
            return a.concat(b);
          }, []);
          filtersTab1 = filtersTab1.filter(function (item, pos) {
            return filtersTab1.indexOf(item) === pos;
          });
          filtersTab2 = filtersTab2.reduce(function (a, b) {
            return a.concat(b);
          }, []);
          filtersTab2 = filtersTab2.filter(function (item, pos) {
            return filtersTab2.indexOf(item) === pos;
          });
          filtersTab1.forEach(function (item, i) {
            var itemFilters = item;
            $("<li class=\"form-item form-item-checkbox\">".concat(Drupal.theme('renderFilters', itemFilters), "</li>")).appendTo($tagsList1);
          });
          filtersTab2.forEach(function (item, i) {
            var itemFilters = item;
            $("<li class=\"form-item form-item-checkbox\">".concat(Drupal.theme('renderFilters', itemFilters), "</li>")).appendTo($tagsList2);
          });

          // Filters

          var $filtersTab1 = $('input[type="checkbox"]', $tagsList1);
          var $filteredResults1 = $('.block-item', $tabContent1);
          var $filtersTab2 = $('input[type="checkbox"]', $tagsList2);
          var $filteredResults2 = $('.block-item', $tabContent2);
          var filterFunc = function filterFunc() {
            var selectedFiltersTab1 = [];
            var selectedFiltersTab2 = [];
            $filtersTab1.filter(':checked').each(function (i, item) {
              selectedFiltersTab1.push(item.value);
            });
            $filtersTab2.filter(':checked').each(function (i, item) {
              selectedFiltersTab2.push(item.value);
            });
            $filteredResults1.each(function (i, item) {
              var $item = $(item);
              var $itemData = $item.data('tag').split(' ');
              var filteredData = $itemData.filter(function (elem) {
                return selectedFiltersTab1.includes(elem);
              });
              $item.addClass('active');
              if (filteredData.length > 0) {
                $item.show();
                count1.show();
                $item.removeClass('out').addClass('active');
              } else {
                $item.removeClass('active').addClass('out');
                setTimeout(function () {
                  $item.hide();
                  if (selectedFiltersTab1.length === 0) {
                    $filteredResults1.removeClass('out').addClass('active').show();
                    count1.hide();
                    checkLength($list1);
                    checkLength($highlighted1);
                  }
                }, 300);
              }
              setTimeout(function () {
                var num1 = $list1.children('.active.not-hidden').length;
                // + $highlighted1.children('.active.not-hidden').length;
                if (num1 > '1') {
                  count1.html("<span>".concat(num1, "</span><span>").concat(Drupal.t(' Results'), "</span>"));
                } else {
                  count1.html("<span>".concat(num1, "</span><span>").concat(Drupal.t(' Result'), "</span>"));
                }
                if (num1 === 0) {
                  noData1.addClass('is-active');
                  count1.hide();
                  $list1.parents('.list-wrapper').find('.sub-title').css('display', 'none');
                } else {
                  noData1.removeClass('is-active');
                  count1.show();
                  $list1.parents('.list-wrapper').find('.sub-title').css('display', 'block');
                }
              }, 300);
            });
            $filteredResults2.each(function (i, item) {
              var $item = $(item);
              var $itemData = $item.data('tag').split(' ');
              var filteredData = $itemData.filter(function (elem) {
                return selectedFiltersTab2.includes(elem);
              });
              $item.addClass('active');
              if (filteredData.length > 0) {
                $item.show();
                count2.show();
                $item.removeClass('out').addClass('active');
              } else {
                $item.removeClass('active').addClass('out');
                setTimeout(function () {
                  $item.hide();
                  if (selectedFiltersTab2.length === 0) {
                    $filteredResults2.removeClass('out').addClass('active').show();
                    count2.hide();
                    checkLength($list2);
                    checkLength($highlighted2);
                  }
                }, 300);
              }
              setTimeout(function () {
                var num2 = $list2.children('.active.not-hidden').length;
                // + $highlighted2.children('.active.not-hidden').length;

                if (num2 > '1') {
                  count2.html("<span>".concat(num2, "</span><span>").concat(Drupal.t(' Results'), "</span>"));
                } else {
                  count2.html("<span>".concat(num2, "</span><span>").concat(Drupal.t(' Result'), "</span>"));
                }
                if (num2 === 0) {
                  noData2.addClass('is-active');
                  count2.hide();
                  $list2.parents('.list-wrapper').find('.sub-title').css('display', 'none');
                } else {
                  noData2.removeClass('is-active');
                  count2.show();
                  $list2.parents('.list-wrapper').find('.sub-title').css('display', 'block');
                }
              }, 300);
            });
            checkLength($list1);
            checkLength($highlighted1);
            checkLength($list2);
            checkLength($highlighted2);
          };
          $searchFormTab1.submit(function (e) {
            e.preventDefault();
            var $searchInput = $('input', $searchFormTab1);
            var query = $searchInput.val().replaceAll(regEx, '').toLowerCase();

            // const str = "CrÃ¨me BrulÃ©e";
            // console.log(query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
            query.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript

            var queryArr = query.split(' ');
            if (query.length <= 0) {
              return;
            }
            $filteredResults1.each(function (i, item) {
              var $item = $(item);
              var $itemDataTag = '';
              var $itemDataTitle = '';
              var $itemDataDescription = '';
              var totalWordsArray = [];
              if ($('input[type="checkbox"]:checked', $tagsList1).length > 0) {
                $item = $(item).not('.out');
              }
              if ($item.length > 0) {
                $itemDataTag = $item.data('tag').toLowerCase().split(' ');
                $itemDataTitle = $item.data('title').toLowerCase().replaceAll(regEx, '').split(' ').filter(function (el) {
                  return el !== '';
                });
                $itemDataDescription = $item.data('description').toLowerCase().split(' ');
                totalWordsArray = $itemDataTag.concat($itemDataTitle, $itemDataDescription);
              }
              var checkIfContain = function checkIfContain(stringsArray, string) {
                var flag = false;
                stringsArray.forEach(function (arElement) {
                  if (arElement.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(string.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
                    flag = true;
                  }
                });
                return flag;
              };

              // AND statement START

              $item.removeClass('out').addClass('active');
              $item.show();
              for (var _i = 0; _i < queryArr.length; _i++) {
                if (queryArr[_i] !== '' && !checkIfContain(totalWordsArray, queryArr[_i])) {
                  $item.removeClass('active').addClass('out');
                  $item.hide();
                }
              }

              // AND statement END

              // OR statement start

              // $item.hide();
              // $item.removeClass('active').addClass('out');
              //
              // for (let i = 0; i < queryArr.length; i++) {
              //   if (queryArr[i] !== '' && checkIfContain(totalWordsArray, queryArr[i])) {
              //     $item.removeClass('out').addClass('active');
              //     $item.show();
              //   }
              // }

              // OR statement END
            });

            setTimeout(function () {
              var num1 = $list1.children('.active').length;
              // + $highlighted1.children('.active').length;

              if (num1 > '1') {
                count1.html("<span>".concat(num1, "</span><span>").concat(Drupal.t(' Results'), "</span>"));
              } else {
                count1.html("<span>".concat(num1, "</span><span>").concat(Drupal.t(' Result'), "</span>"));
              }
              if (num1 === 0) {
                noData1.addClass('is-active');
                count1.hide();
              } else {
                noData1.removeClass('is-active');
                count1.show();
                if ($highlighted1.children('.active').length) {
                  $highlighted1.children('.active').addClass('out');
                }
                checkLength($highlighted1);
              }
            }, 300);

            // $filtersTab1.on('change', filterFunc);
            checkLength($list1);
            checkLength($highlighted1);
          });
          $searchFormTab2.submit(function (e) {
            e.preventDefault();
            var $searchInput = $('input', $searchFormTab2);
            var query = $searchInput.val().replaceAll(regEx, '').toLowerCase();
            var queryArr = query.split(' ');
            if (query.length <= 0) {
              return;
            }
            $filteredResults2.each(function (i, item) {
              var $item = $(item);
              var $itemDataTag = '';
              var $itemDataTitle = '';
              var $itemDataDescription = '';
              var totalWordsArray = [];
              if ($('input[type="checkbox"]:checked', $tagsList2).length > 0) {
                $item = $(item).not('.out');
              }
              if ($item.length > 0) {
                $itemDataTag = $item.data('tag').toLowerCase().split(' ');
                $itemDataTitle = $item.data('title').toLowerCase().replaceAll(regEx, '').split(' ').filter(function (el) {
                  return el !== '';
                });
                $itemDataDescription = $item.data('description').toLowerCase().split(' ');
                totalWordsArray = $itemDataTag.concat($itemDataTitle, $itemDataDescription);
              }
              var checkIfContain = function checkIfContain(stringsArray, string) {
                var flag = false;
                stringsArray.forEach(function (arElement) {
                  if (arElement.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(string.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
                    flag = true;
                  }
                });
                return flag;
              };

              // AND statement START

              $item.removeClass('out').addClass('active');
              $item.show();
              for (var _i2 = 0; _i2 < queryArr.length; _i2++) {
                if (queryArr[_i2] !== '' && !checkIfContain(totalWordsArray, queryArr[_i2])) {
                  $item.removeClass('active').addClass('out');
                  $item.hide();
                }
              }

              // AND statement END

              // OR statement START

              // $item.hide();
              // $item.removeClass('active').addClass('out');
              //
              // for (let i = 0; i < queryArr.length; i++) {
              //   if (queryArr[i] !== '' && checkIfContain(totalWordsArray, queryArr[i])) {
              //     $item.removeClass('out').addClass('active');
              //     $item.show();
              //   }
              // }

              //  OR statement END
            });

            setTimeout(function () {
              var num2 = $list2.children('.active').length;
              // + $highlighted2.children('.active').length;

              if (num2 > '1') {
                count2.html("<span>".concat(num2, "</span><span>").concat(Drupal.t(' Results'), "</span>"));
              } else {
                count2.html("<span>".concat(num2, "</span><span>").concat(Drupal.t(' Result'), "</span>"));
              }
              if (num2 === 0) {
                noData2.addClass('is-active');
                count2.hide();
              } else {
                noData2.removeClass('is-active');
                count2.show();
                if ($highlighted2.children('.active').length) {
                  $highlighted2.children('.active').addClass('out');
                }
                checkLength($highlighted2);
              }
            }, 300);
            checkLength($list2);
            checkLength($highlighted2);
          });
          var clearInput = function clearInput(e) {
            if (e.target.value.length === 0) {
              filterFunc();
            }
          };

          // Popup
          var $trigger = $('.trigger-popup');
          var $closePopup = $('.close-popup');
          $trigger.click(function (e) {
            var $target = $(e.target);
            var $btnClosePopup = $target.parent().find('.close-popup');
            $target.attr('aria-expanded', 'true');
            $target.parent().addClass('is-active');
            $btnClosePopup.focus();
          });
          $closePopup.click(function (e) {
            var $target = $(e.target);
            var $triggerPopup = $target.parents('.block-item').find('.trigger-popup');
            $target.parents('.block-item').removeClass('is-active');
            $triggerPopup.attr('aria-expanded', 'false');
            $triggerPopup.focus();
          });

          // Generate share popup
          var $blockItem = $('.block-item', $element);
          $blockItem.each(function (i, item) {
            var $item = $(item);
            var $box = $('.addthis-box', $item);
            var mode = $('html').hasClass('no-touchevents') ? 'desktop' : 'mobile';
            var data = drupalSettings.tandem_addthis.services;
            var $head = $('.item-header', $item);
            var $link = $('.share-popup-trigger', $item);
            var $closeButton = $('.share__items__close', $item);
            var popupSubtitleText = $head.find('.title').text().trim();
            var popupSubTitle = "<p class=\"subtitle\">".concat(popupSubtitleText, "</p>");
            var $sharePopup = $('.share__items');
            if (data === null || mode === null) {
              return;
            }
            var services = data[mode];
            for (var service in services) {
              if (services[service].service_name === 'Email') {
                $box.append('<button class="add-this-custom__email-button js-email-share" title="' + services[service].service_name + ' - ' + Drupal.t('new window') + '"></button>');
              } else {
                $box.append("<a class=\"addthis_button_".concat(service, "\" href=\"\" title=\"").concat(services[service].service_name, " - ").concat(Drupal.t('new window'), "\"></a>"));
              }
            }
            $box.before(popupSubTitle);
            $sharePopup.attr('aria-describedby', popupSubtitleText);
            $sharePopup.each(function () {
              var $name = $(_this).find('h1').text();
              $(_this).attr('name', $name);
            });
            $link.click(function (e) {
              e.preventDefault();
              $(document).find('.js-share.show-popup').removeClass('show-popup');
              $item.addClass('show-popup');
            });
            $closeButton.click(function () {
              $item.removeClass('show-popup');
              $link.focus();
            });
            $('body').click(function (e) {
              var $target = $(e.target);
              if (!$target.closest('.js-share').length) {
                $item.removeClass('show-popup');
              }
            });
            $(document).keyup(function (e) {
              if (e.key === 'Escape') {
                $('.js-share.show-popup > button').first().focus();
                $item.removeClass('show-popup');
              }
            });
            $(document).on('keydown', '.share__items a, .share__items button', function (e) {
              var code = e.keyCode || e.which;
              var $tabButton = code === 9;
              var $shiftButton = e.shiftKey;
              var $popupWrapper = $(e.target).closest('.share__items');
              var $openPopup = $item.hasClass('show-popup');
              var $links = $popupWrapper.find('a, button');
              if ($tabButton && $openPopup) {
                if (!$shiftButton && $(e.target)[0] === $links.last()[0]) {
                  e.preventDefault();
                  $popupWrapper.find('.share__items__close').focus();
                }
                if ($shiftButton && $(e.target)[0] === $links.first()[0]) {
                  e.preventDefault();
                  $popupWrapper.find('a:last-child').focus();
                }
              }
            });
          });
          $searchInput1.on('input', clearInput);
          $searchInput2.on('input', clearInput);
          $filtersTab1.on('change', filterFunc);
          $filtersTab2.on('change', filterFunc);
          checkLength($list1);
          checkLength($highlighted1);
          checkLength($list2);
          checkLength($highlighted2);
        };
        $.get('/api/v1/services-list').done(function (response) {
          render(response);
        }).fail(function (error) {
          throw new Error(error);
        });
        Drupal.theme.renderElements = function (itemOfServices) {
          var id = Math.random().toString(36).slice(-8);
          var output = '';
          if (itemOfServices.link !== undefined) {
            output += '<div class="item-header js-share">';
            output += "<h3 class=\"title\"><a class=\"js-services-title\" href=\"".concat(itemOfServices.link.uri, "\" title=\"").concat(itemOfServices.link.title, "\" aria-label=\"").concat(itemOfServices.title, "\">").concat(itemOfServices.title, "</a></h3>");
            output += "<button class=\"share-popup-trigger\" type=\"button\" aria-label=\"".concat(Drupal.t('Share service'), "\">");
            output += '<span class="share__popup__arrow"></span>';
            output += '</button>';
            output += "<div class=\"share__items\" role=\"dialog\" aria-labelledby=\"".concat(Drupal.t('Share this service'), "\">");
            output += "<button type=\"button\" role=\"button\" name=\"".concat(Drupal.t('Close popup'), "\" aria-label=\"").concat(Drupal.t('Close popup'), "\" class=\"share__items__close\"></button>");
            output += "".concat(itemOfServices.share_block);
            output += '</div>';
            output += '</div>';
          } else {
            output += "<h3 class=\"title\">".concat(itemOfServices.title, "</h3>");
          }
          output += '<div class="tags">';
          itemOfServices.tag.forEach(function (item, i) {
            output += "<span class=\"tag\">".concat(item, "</span>");
          });
          output += '</div>';
          if (itemOfServices.img !== undefined) {
            output += '<div class="image">';
            output += '<picture>';
            if (itemOfServices.link !== undefined) {
              output += "<a class=\"js-services-title\" href=\"".concat(itemOfServices.link.uri, "\" title=\"").concat(itemOfServices.link.title, "\" aria-label=\"").concat(itemOfServices.title, "\"><img src=\"").concat(itemOfServices.img[0].url, "\" alt=\"").concat(itemOfServices.img[0].alt, "\" title=\"").concat(itemOfServices.img[0].title, "\"/></a>");
            } else {
              output += "<img src=\"".concat(itemOfServices.img[0].url, "\" alt=\"").concat(itemOfServices.img[0].alt, "\" title=\"").concat(itemOfServices.img[0].title, "\"/>");
            }
            output += '</picture>';
            output += '</div>';
          } else if (itemOfServices.link !== undefined) {
            output += '<div class="image no-image">';
            output += "<span class=\"js-services-title\"\n                        title=\"".concat(itemOfServices.link.title, "\"></span>");
            output += '</div>';
          }
          if (itemOfServices.description !== '') {
            output += "<p class=\"description\">".concat(itemOfServices.description, "</p>");
          }
          output += "<button class=\"trigger-popup\" aria-expanded=\"false\" aria-haspopup=\"true\" aria-control=\"".concat(id, "\">").concat(Drupal.t('Read more'), "</button>");
          output += "<div class=\"item-popup\" id=\"".concat(id, "\">");
          output += '<div class="item-popup-header">';
          output += "<button class=\"close-popup\">".concat(Drupal.t('Close'), "</button>");
          if (itemOfServices.link !== undefined) {
            output += "<h3 class=\"title\"><a class=\"js-services-title\" href=\"".concat(itemOfServices.link.uri, "\" title=\"").concat(itemOfServices.link.title, "\" aria-label=\"").concat(itemOfServices.title, "\">").concat(itemOfServices.title, "</a></h3>");
          } else {
            output += "<h3 class=\"title\">".concat(itemOfServices.title, "</h3>");
          }
          output += '</div>';
          output += '<div class="tags">';
          itemOfServices.tag.forEach(function (item, i) {
            output += "<span class=\"tag\">".concat(item, "</span>");
          });
          output += '</div>';
          if (itemOfServices.description !== '') {
            output += "<p class=\"description\">".concat(itemOfServices.description, "</p>");
          }
          output += '</div>';
          output += '<div class="link-wrapper">';
          if (itemOfServices.link !== undefined) {
            output += "<a href=\"".concat(itemOfServices.link.uri, "\" title=\"").concat(itemOfServices.link.title, "\" class=\"link js-services-title\" aria-label=\"").concat(itemOfServices.title, "\">").concat(itemOfServices.title, "</a>");
          }
          output += '</div>';
          return output;
        };
        Drupal.theme.renderFilters = function (itemFilters) {
          var output = '';
          var value = itemFilters.replace(/\s/g, '-');
          var valueClear = value.replace('<span>', '').replace('</span>', '');
          output += "<label><input type=\"checkbox\" aria-label=\"".concat(valueClear, "\" value=\"").concat(value, "\" name=\"").concat(value, "\"></input>");
          output += "".concat(itemFilters, "</label>");
          return output;
        };
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create styleguide accordeon.
   */
  Drupal.behaviors.edugouvStyleguideAccordeon = {
    attach: function attach(context) {
      $('.styleguide-accordeon-item', context).once('edugouvStyleguideAccordeon').each(function (index, element) {
        var $this = $(element);
        var $accordeonTrigger = $('.styleguide-title', $this);
        var $accordeonContent = $('.styleguide-content', $this);
        $accordeonTrigger.click(function (e) {
          e.preventDefault();
          $(e.target).toggleClass('active');
          if ($(e.target).hasClass('active')) {
            $accordeonContent.slideDown();
          } else {
            $accordeonContent.slideUp();
          }
          $('.js-vertical-masonry').isotope();
          $('.js-gallery').isotope();
          $('.js-publication-slider').slick('setPosition');
        });
        setTimeout(function () {
          $accordeonContent.slideUp();
        }, 1);
      });
    }
  };
})(jQuery, Drupal);
"use strict";

(function ($, Drupal) {
  /**
   * Create sticky header.
   */
  Drupal.behaviors.edugouvStickyHeader = {
    attach: function attach(context) {
      $('.js-header', context).once('edugouvStickyHeader').each(function (index, element) {
        var $this = $(element);
        var $headerOffset = $this.offset().top;
        var $window = $(window);
        var miniSiteMenuOuter = document.querySelector('.mini-site-menu-outer');
        var miniSiteMenu = document.querySelector('.mini-site-menu-wrapper');
        var crisisMessage = document.querySelector('.back-office-message-tab');
        var summaryBlock = document.querySelector('.js-edugouv-progress-bar');
        var totalHeight = 0;
        var gap = 5;
        var headerHeight = 100;
        var toolbarTop = document.querySelector('#toolbar-bar');
        var toolbarBot = document.querySelector('.toolbar-tray-horizontal.is-active');
        var toolbarBotHeight = toolbarBot ? toolbarBot.offsetHeight : 0;
        var crisisMessageHeight = crisisMessage ? crisisMessage.offsetHeight : 0;
        function getTotalHeight() {
          if (toolbarTop) {
            // eslint-disable-next-line max-len
            totalHeight = toolbarTop.offsetHeight + toolbarBotHeight + headerHeight + crisisMessageHeight;
          } else {
            totalHeight = headerHeight + crisisMessageHeight;
          }
        }
        var checkMiniMenuPosition = function checkMiniMenuPosition() {
          // eslint-disable-next-line max-len
          if ($window.scrollTop() > 0 && totalHeight >= miniSiteMenuOuter.getBoundingClientRect().top) {
            miniSiteMenuOuter.classList.add('fixed');
            miniSiteMenuOuter.style.height = "".concat(miniSiteMenu.offsetHeight + gap, "px");
            miniSiteMenu.style.top = "".concat(totalHeight, "px");
          } else {
            miniSiteMenuOuter.classList.remove('fixed');
            miniSiteMenuOuter.style.height = '';
          }
        };
        function checkSummaryPosition() {
          summaryBlock.style.top = "".concat(totalHeight + miniSiteMenuOuter.offsetHeight - gap, "px");
        }
        $window.scroll(function () {
          headerHeight = element.offsetHeight;
          getTotalHeight();
          if (summaryBlock && miniSiteMenuOuter) {
            checkSummaryPosition();
          }
          if ($window.scrollTop() > $headerOffset) {
            $this.addClass('fixed');
          } else {
            $this.removeClass('fixed');
            if ($(window).width() >= 1024) {
              if ($('.js-menu-toggle.is-mini-menu').hasClass('is-active')) {
                $('.page-wrapper').css('marginTop', '');
              } else if ($('.mini-site-menu').length) {
                $('.page-wrapper').css('marginTop', "-".concat(60, "px"));
              }
            }
          }
          if (miniSiteMenuOuter && $(element).hasClass('fixed')) {
            checkMiniMenuPosition();
          }
        });
        var sumBlockHeight = 0;
        if ($(window).width() >= 768) {
          sumBlockHeight = 0;
        } else {
          sumBlockHeight = summaryBlock ? summaryBlock.offsetHeight : 0;
        }
        $(document).ready(function () {
          setTimeout(function () {
            var urlHash = window.location.href.split('#')[1];
            var item = $("#".concat(urlHash));
            var miniMenuHeight = miniSiteMenuOuter ? miniSiteMenuOuter.offsetHeight : 0;
            if (urlHash && item.length) {
              $('html,body').animate({
                scrollTop: item.offset().top - (totalHeight + miniMenuHeight + sumBlockHeight + 20)
              }, 1000);
            }
          }, 500);
        });
        getTotalHeight();
        var richMedia = $('.rich-media.ckeditor-text');
        if (richMedia.parents('.container').length) {
          richMedia.addClass('no-margin');
        }
      });
    }
  };
  Drupal.behaviors.insertQuickLinksToMenu = {
    attach: function attach(context) {
      var _this = this;
      $('.js-header', context).once('insertQuickLinksToMenu').each(function (index, element) {
        var mainMenu = $(element).find('.main-menu');
        var quickMenuList = $(element).find('.quick-links__list');
        var closeButton = '<li class="quick-menu__back"><button  class="quick-menu__back-button" type="button"></button></li>';
        var closeButtonMain = "<li class=\"quick-menu__back\"><button  class=\"quick-menu__back-button\" type=\"button\">".concat(Drupal.t('Back to the portal'), "</button></li>");
        quickMenuList.prepend(closeButtonMain);
        $('.quick-links__list ul').prepend(closeButton);
        var miniSiteMenu = $('.mini-site-menu');
        var quickMenuEmpty = $('.header-quick-links');
        var quickLinksInside = $('.quick-links__inside');
        var quickLinksInsideItems = $('.quick-links__inside > li');
        quickLinksInsideItems.each(function (i, item) {
          if (!$(item).children('ul').length) {
            return;
          }
          $('<button class="quick-menu__link-button"></button>').insertAfter($(item).children('a'));
        });
        $('<button class="quick-menu__link-button"></button>').insertAfter(quickLinksInside.siblings('a'));
        quickLinksInside.parent().addClass('quick-menu__appended');
        $(document).on('click', '.js-menu-toggle', function () {
          mainMenu.find('li').removeClass('active');
        });
        $('.quick-menu__appended .quick-menu__back-button').each(function (btnIndex, btnElement) {
          var parentList = $(btnElement).closest('ul');
          var callLink = parentList.closest('li');
          $(btnElement).text(callLink.children('a').text());
        });
        if (miniSiteMenu.length) {
          $('.js-menu-toggle').addClass('is-mini-menu');
          var MENU_HEIGHT = 55;
          if (!$('.header-quick-links ul').length) {
            quickMenuEmpty.append("<ul>".concat(closeButton, "</ul>")).addClass('is-empty');
          }
          if ($(window).width() >= 1024) {
            $('.page-wrapper').css('marginTop', "-".concat(MENU_HEIGHT, "px"));
          } else {
            $('.page-wrapper').css('marginTop', '');
          }
          $(document).on('click', '.js-menu-toggle.is-mini-menu', function () {
            if ($(window).width() < 1024) {
              var pathName = window.location.pathname;
              var locationLink = $('.header-quick-links').find("a[href=\"".concat($.trim(pathName), "\"]"));
              locationLink.parents('li.quick-menu__appended').addClass('active');
              $('.header-quick-links').addClass('active');
            } else if ($('.js-header').hasClass('fixed')) {
              return;
            }
            if ($(_this).hasClass('is-active')) {
              $('.page-wrapper').css('marginTop', '');
            } else if ($(window).width() < 1024) {
              $('.page-wrapper').css('marginTop', '');
            } else {
              $('.page-wrapper').css('marginTop', "-".concat(MENU_HEIGHT, "px"));
            }
          });
          var checkUserLocation = function checkUserLocation() {
            var pathName = window.location.pathname;
            var locationLink = $('.mini-site-menu__list').find("a[href=\"".concat($.trim(pathName), "\"]"));
            if (locationLink.length) {
              locationLink.parents('li:last').addClass('link-highlighted');
            }
          };
          checkUserLocation();
        } else {
          if (!$('.header-quick-links ul').length) {
            quickMenuEmpty.addClass('is-empty is-empty--full');
          }
          $('.js-menu-toggle').addClass('no-mini-menu');
          if ($(window).width() >= 1024) {
            $('html').addClass('menu-open');
          }
        }
        $(document).on('keydown', '.js-menu-toggle.is-active', function (event) {
          var keyCode = event.keyCode || event.charCode;
          if (keyCode === 9) {
            $('.main-menu li:first span').focus();
          }
        });
        $(document).on('click', '.quick-menu__back-button', function (event) {
          var parentUl = event.target.closest('ul');
          parentUl.closest('li').classList.remove('active');
        });
        $(document).on('click', '.quick-menu__link, .quick-menu__link-button', function (event) {
          event.preventDefault();
          var link = event.target;
          var linkParent = link.closest('li');
          if (linkParent.classList.contains('active')) {
            linkParent.classList.remove('active');
            link.classList.remove('active');
          } else {
            linkParent.classList.add('active');
            link.classList.add('active');
          }
          $(document).on('click', function (ev) {
            if ($(window).width() < 1024) {
              return;
            }
            if (!ev.target.closest('.header-quick-links')) {
              linkParent.classList.remove('active');
              link.classList.remove('active');
            }
          });
        });
      });
    }
  };
  Drupal.behaviors.checkUserCurrentLocation = {
    attach: function attach(context) {
      $('.main-menu', context).once('checkUserCurrentLocation').each(function (index, element) {
        var pathName = window.location.pathname;
        var locationLink = $(element).find("a[href=\"".concat($.trim(pathName), "\"]"));
        locationLink.parents('li:last').children('span, a').addClass('is-active');
      });
    }
  };
  Drupal.behaviors.showMiniSiteMenuOnFocus = {
    attach: function attach(context) {
      $('.mini-site-menu', context).once('showMiniSiteMenuOnFocus').each(function (index, element) {
        var menuElements = $('.mini-site-menu__list > li', $(element));
        menuElements.each(function (i, el) {
          $(el).children('span').attr('tabindex', 0);
          $(el).on('keyup', function (e) {
            if ($(e.target).closest('.show-low-menu').length <= 0) {
              $(element).find('.mini-site-menu__list > li').removeClass('show-low-menu');
            }
            $(el).addClass('show-low-menu');
          });
          $(document).on('keyup', function (event) {
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 9 && $(event.target).closest('.show-low-menu').length <= 0) {
              $(element).find('.mini-site-menu__list > li').removeClass('show-low-menu');
            }
          });
        });
      });
    }
  };
  Drupal.behaviors.customEmailSharing = {
    attach: function attach(context) {
      $('.page-wrapper', context).once('customEmailSharing').each(function (index, element) {
        function closePopup(startLocation, form, popupBox) {
          startLocation.append(form);
          popupBox.remove();
        }
        function createEmailSharePopup(block) {
          var form = block.querySelector('form');
          var startLocation = block.querySelector('.forward');
          var popupBox = document.createElement('div');
          var popupBack = document.createElement('div');
          var popupContainer = document.createElement('div');
          var popupCloseButton = document.createElement('button');
          var shareButton = document.querySelector('.js-share');
          popupCloseButton.classList.add('add-this-custom__close');
          popupCloseButton.setAttribute('title', Drupal.t('Fermer le popup'));
          popupBox.classList.add('add-this-custom__pop-box');
          popupBack.classList.add('add-this-custom__pop-back');
          popupContainer.classList.add('add-this-custom__pop-container');
          popupBack.addEventListener('click', function () {
            return closePopup(startLocation, form, popupBox);
          });
          popupCloseButton.addEventListener('click', function () {
            closePopup(startLocation, form, popupBox);
            shareButton.querySelectorAll('button')[0].focus();
          });
          popupContainer.append(form);
          popupContainer.prepend(popupCloseButton);
          popupBox.append(popupContainer);
          popupBox.append(popupBack);
          document.querySelector('#main-content').prepend(popupBox);
          popupBox.querySelector('details').setAttribute('open', 'true');
          shareButton.classList.remove('show-popup');
          var formInputs = popupContainer.querySelectorAll('input');
          formInputs[0].focus();
          popupContainer.querySelector('.js-form-submit').addEventListener('keydown', function (event) {
            if (event.shiftKey && event.key === 'Tab') {
              formInputs[formInputs.length - 1].focus();
            } else if (event.key === 'Tab') {
              setTimeout(function () {
                popupCloseButton.focus();
              });
            }
          });
          popupCloseButton.addEventListener('keydown', function (event) {
            if (event.shiftKey && event.key === 'Tab') {
              setTimeout(function () {
                popupContainer.querySelector('.js-form-submit').focus();
              });
            }
          });
          popupBox.addEventListener('keyup', function (event) {
            var code = event.key;
            if (popupBox && code === 'Escape') {
              closePopup(startLocation, form, popupBox);
              shareButton.querySelectorAll('button')[0].focus();
            }
          });
        }
        $(document).ready(function () {
          setTimeout(function () {
            var shareButtons = element.querySelectorAll('.js-email-share');
            shareButtons.forEach(function (shareButton) {
              shareButton.addEventListener('click', function () {
                createEmailSharePopup(shareButton.closest('.share_addthis_actions'));
              });
            });
          }, 1000);
        });
      });
    }
  };
  Drupal.behaviors.isWindowNew = {
    attach: function attach(context) {
      $('[data-history-button]', context).once('isWindowNew').each(function (index, element) {
        if (window.history.length < 2) {
          element.classList.add('hidden');
        }
      });
    }
  };
})(jQuery, Drupal);
//# sourceMappingURL=behaviors.js.map