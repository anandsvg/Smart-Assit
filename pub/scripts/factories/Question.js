define([
	'app'
], function(app) {
	app.register.factory('Question', function() {
		return function($this, $scope) {
			function Question(q) {
				var $t = this;
				_.each(q, function(a, b) {
					$t[b] = a;
				});
			};

			Question.prototype.remove = function() {
				$scope.data.questions.splice(this.index, 1);
				$scope.updateIndicies();
			};

			Question.prototype.move = function(d) {
				$this.move(
					angular.copy($scope.data.questions),
					'question',
					d,
					this.order
				);
			};

			Question.prototype.makeSelectedOption = function(order) {
				var $t = this;

				_.each($t.options, function(a, b) {
					if ($t.type == 'checkbox') {
						if (a.order == order) {
							$t.options[b].selected = !$t.options[b].selected;
						}
					} else {
						$t.options[b].selected = (a.order == order) ? !$t.options[b].selected : false;
						if (a.order == order) {
							$t.value = ($t.options[b].selected) ? $t.options[b].value : '';
						}
					}
				});
			};

			Question.prototype.addOption = function() {
				console.log('add option');
				var l = this.options.length;
				this.options.push({
					order: l,
					label: 'Option ' + (l + 1),
					value: 'option-' + (l + 1),
					selected: false
				});
			};

			Question.prototype.removeOption = function(index) {
				this.options.splice(index, 1);
			};

			Question.prototype.getOptions = function() {
				return this.options;
			};

			function defaultQuestion(c, n) {
				return {
					isCollapsed: false,
					advancedIsCollapsed: true,
					index: c,
					order: c,
					name: 'ques' + n,
					label: 'Question ' + n,
					type: 'text',
					required: false,
					value: '',
					options: [{
						label: 'Option 1',
						value: 'option-1',
						order: 0,
						default: false,
						selected: false
					}]
				};
			};

			return {
				question: Question,
				defaultQuestion: defaultQuestion
			};
		}
	});
});