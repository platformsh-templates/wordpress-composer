<?php
/**
 * Customizer Control: link.
 *
 * Creates a link control.
 *
 * @package     Astra
 * @author      Astra
 * @copyright   Copyright (c) 2019, Astra
 * @link        https://wpastra.com/
 * @since       2.3.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Link control.
 */
class Astra_Control_Link extends WP_Customize_Control {

	/**
	 * The control type.
	 *
	 * @access public
	 * @var string
	 */
	public $type = 'ast-link';

	/**
	 * The control type.
	 *
	 * @access public
	 * @var string
	 */
	public $suffix = '';

	/**
	 * Refresh the parameters passed to the JavaScript via JSON.
	 *
	 * @see WP_Customize_Control::to_json()
	 */
	public function to_json() {
		parent::to_json();

		$this->json['default'] = $this->setting->default;
		if ( isset( $this->default ) ) {
			$this->json['default'] = $this->default;
		}
		$this->json['value'] = $this->value();
		$this->json['label'] = esc_html( $this->label );
	}

	/**
	 * An Underscore (JS) template for this control's content (but not its container).
	 *
	 * Class variables for this control class are available in the `data` JS object;
	 * export custom variables by overriding {@see WP_Customize_Control::to_json()}.
	 *
	 * @see WP_Customize_Control::print_template()
	 *
	 * @access protected
	 */
	protected function content_template() {
		?>
		<#
		var name = data.settings.default;
		name = name.replace( '[', '-' );
		name = name.replace( ']', '' );

		if ( data.label ) { #>
			<label>
				<span class="customize-control-title">{{{ data.label }}}</span>
			</label>
		<# } #>
			<div class="customize-control-content">
				<input type="text" class="ast-link-input" value="{{data.value.url}}" >
			</div>
			<div class="customize-control-content ast-link-open-in-new-tab-wrapper">
				<input type="checkbox" id="ast-link-open-in-new-tab" class="ast-link-open-in-new-tab" name="ast-link-open-in-new-tab" {{ (data.value.new_tab) ? "checked" : ""}}>
				<label for="ast-link-open-in-new-tab">Open in a New Tab</label>
			</div>
			<div class="customize-control-content">
				<label>
					<span class="customize-control-title">Button Link Rel</span>
				</label>
				<input type="text" class="ast-link-relationship" value="{{data.value.link_rel}}" >
			</div>
		<input type="hidden" id="_customize-input-{{data.settings.default}}" class="customize-link-control-data" name="{{name}}" data-customize-setting-link="{{data.settings.default}}" data-value="{{ JSON.stringify( data.value ) }}">
		<?php
	}

	/**
	 * Render the control's content.
	 *
	 * @see WP_Customize_Control::render_content()
	 * @since  2.0.0
	 */
	protected function render_content() {}
}
