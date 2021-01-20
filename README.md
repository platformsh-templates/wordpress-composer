# WordPress (Composer) for Platform.sh

<p align="center">
<a href="https://console.platform.sh/projects/create-project?template=https://raw.githubusercontent.com/platformsh/template-builder/master/templates/wordpress-composer/.platform.template.yaml&utm_content=wordpress-composer&utm_source=github&utm_medium=button&utm_campaign=deploy_on_platform">
    <img src="https://platform.sh/images/deploy/lg-blue.svg" alt="Deploy on Platform.sh" width="180px" />
</a>
</p>

This template builds WordPress on Platform.sh using the [`johnbloch/wordpress`](https://github.com/johnpbloch/wordpress) "Composer Fork" of WordPress.  Plugins and themes should be managed with Composer exclusively.  A custom configuration file is provided that runs on Platform.sh to automatically configure the database, so the installer will not ask you for database credentials.  For local-only configuration you can use a `wp-config-local.php` file that gets excluded from Git.

WordPress is a blogging and lightweight CMS written in PHP.

## Features

* PHP 7.4
* MariaDB 10.4
* Automatic TLS certificates
* Composer-based build

## Post-install

1. Run through the WordPress installer as normal.  You will not be asked for database credentials as those are already provided.

2. This example looks for an optional `wp-config-local.php` in the project root that you can use to develop locally. This file is ignored in Git.

Example `wp-config-local.php`:

```php
<?php

define('WP_HOME', "http://localhost");
define('WP_SITEURL',"http://localhost");
define('DB_NAME', "my_wordpress");
define('DB_USER', "user");
define('DB_PASSWORD', "a strong password");
define('DB_HOST', "127.0.0.1");
define('DB_CHARSET', 'utf8');
define('DB_COLLATE', '');

// These will be set automatically on Platform.sh to a different value, but that won't cause issues.
define('AUTH_KEY', 'SECURE_AUTH_KEY');
define('LOGGED_IN_KEY', 'LOGGED_IN_SALT');
define('NONCE_KEY', 'NONCE_SALT');
define('AUTH_SALT', 'SECURE_AUTH_SALT');
```

## Customizations

The following changes have been made relative to WordPress as it is downloaded from WordPress.org.  If using this project as a reference for your own existing project, replicate the changes below to your project.

* It uses the [`johnbolch/wordpress`](https://github.com/johnpbloch/wordpress) "Composer Fork" of WordPress, which allow the site to be managed entirely with Composer.
* The `.platform.app.yaml`, `.platform/services.yaml`, and `.platform/routes.yaml` files have been added.  These provide Platform.sh-specific configuration and are present in all projects on Platform.sh.  You may customize them as you see fit.
* An additional Composer library, [`platformsh/config-reader`](https://github.com/platformsh/config-reader-php), has been added.  It provides convenience wrappers for accessing the Platform.sh environment variables.
* The `wp-config.php` file has been modified to use the Config Reader to configure WordPress based on Platform.sh environment variables if present.  If not, your own `wp-config-local.php` file will be loaded to configure the site for local development.
* The upstream `composer.json` file has been modified to include the script `movewpconfig`. It moves `wp-config.php` into the default install directory and docroot `wordpress` after composer install is run.
* A base [Landofile](https://docs.lando.dev/config/lando.html#base-file) provides configuration to use this template locally using [Lando](https://docs.lando.dev).

## Local development

This template has been configured for use with [Lando](https://docs.lando.dev).  Lando is Platform.sh's recommended local development tool.  It is capable of reading your Platform.sh configuration files and standing up an environment that is _very similar_ to your Platform.sh project.  Additionally, Lando can easily pull down databases and file mounts from your Platform.sh project.

To get started using Lando with your Platform.sh project check out the [Quick Start](https://docs.platform.sh/development/local/lando.html) or the [official Lando Platform.sh documentation](https://docs.lando.dev/config/platformsh.html).

## References

* [WordPress](https://wordpress.org/)
* [WordPress on Platform.sh](https://docs.platform.sh/frameworks/wordpress.html)
* [PHP on Platform.sh](https://docs.platform.sh/languages/php.html)
* [How to install Wordpress plugins and themes with Composer](https://community.platform.sh/t/how-to-install-wordpress-plugins-and-themes-with-composer/507)
* [How to install custom/private Wordpress plugins and themes with Composer](https://community.platform.sh/t/how-to-install-custom-private-wordpress-plugins-and-themes-with-composer/622)
