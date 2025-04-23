---
title: Publishing Flet app to multiple platforms
slug: /publish
---

## Introduction

Flet CLI provides [`flet build`](/docs/reference/cli/build) command that allows packaging Flet app into a standalone executable or install package for distribution.

## Platform Matrix

The table below outlines the operating systems compatible with the `flet build` command for creating packages for various platforms:

| OS / `flet build` Target | `apk/aab` | `ipa` | `macos` | `linux` | `windows` | `web` |
|:-------------------------:|:---------:|:-----:|:-------:|:-------:|:---------:|:-----:|
| **macOS**                | ✅        | ✅    | ✅      | ❌      | ❌        | ✅    |
| **Windows**              | ✅        | ❌    | ❌      | ✅ (via WSL) | ✅    | ✅    |
| **Linux**                | ✅        | ❌    | ❌      | ✅      | ❌        | ✅    |

**Notes:**
- **WSL (Windows Subsystem for Linux)** is required for building Linux apps on Windows.

## Prerequisites

### Flutter SDK

[Flutter](https://flutter.dev) is required to build Flet apps for any platform. 

If the minimum required version of the Flutter SDK is not already available in the system `PATH`, it will be automatically downloaded and installed (in the `$HOME/flutter/{version}` directory) during the first build process.

<!-- TODO: Add a link to a table containing a map for Flet to min Flutter version required -->

## Project structure

`flet build` command assumes the following minimal Flet project structure:

```
├── README.md
├── pyproject.toml
└── src
    ├── assets
    │   └── icon.png
    └── main.py
```

- `main.py` is the [entry point](#entry-point) of your Flet application with `ft.run(main)` at the end.

- `assets` is an optional directory that contains application assets (images, sound, text and other files required by your app) as well as images used for package [icons](#icons) and [splash screens](#splash-screen).

- `pyproject.toml` serves as the central configuration file for your application. It includes metadata, dependencies, and build settings. At a minimum, the `dependencies` section should specify the `flet` package as a required dependency:

  ```toml title="pyproject.toml"
  [project]
  name = "myapp"
  version = "0.1.0"
  description = ""
  readme = "README.md"
  requires-python = ">=3.9"
  authors = [
      { name = "Flet developer", email = "you@example.com" }
  ]
  dependencies = [
    "flet"
  ]

  [tool.flet]
  org = "com.mycompany"
  product = "MyApp"
  company = "My Company"
  copyright = "Copyright (C) 2025 by My Company"

  [tool.flet.app]
  path = "src"
  ```

:::note
We recommend using `pyproject.toml` to define app requirements for new projects instead of `requirements.txt`. If both files are present, `flet build` will ignore `requirements.txt`.

Avoid using `pip freeze > requirements.txt` to generate dependencies, as it may include packages incompatible with the target platform. Instead, manually specify only the direct dependencies required by your app, including `flet`.
:::

To quickly set up a project with the correct structure, use the `flet create` command:

```bash
flet create <project-name>
```

Where `<project-name>` is the name for your project directory.

## How it works

`flet build <target_platform>` command could be run from the root of Flet app directory:

```
<flet_app_directory> % flet build <target_platform>
```

where `<target_platform>` could be one of the following: `apk`, `aab`, `ipa`, `web`, `macos`, `windows`, `linux`.

When running from a different directory you can provide the path to a directory with Flet app:

```
flet build <target_platform> <path_to_python_app>
```

Build results are copied to `<python_app_directory>/build/<target_platform>`. You can specify a custom output directory with `--output` option:

```
flet build <target_platform> --output <path-to-output-dir>
```

`flet build` uses Flutter SDK and the number of Flutter packages to build a distribution package from your Flet app.

When you run `flet build <target_platform>` command it:

* Creates a new Flutter project in `{flet_app_directory}/build/flutter` directory from https://github.com/flet-dev/flet-build-template template. Flutter app will contain a packaged Python app in the assets and use `flet` and `serious_python` packages to run Python app and render its UI respectively. The project is ephemeral and deleted upon completion.
* Copies custom icons and splash images (see below) from `assets` directory into a Flutter project.
* Generates icons for all platforms using [`flutter_launcher_icons`](https://pub.dev/packages/flutter_launcher_icons) package.
* Generates splash screens for web, iOS and Android targets using [`flutter_native_splash`](https://pub.dev/packages/flutter_native_splash) package.
* Packages Python app using `package` command of [`serious_python`](https://pub.dev/packages/serious_python) package. `package` command installs pure and binary Python packages from https://pypi.org and https://pypi.flet.dev for selected platform. If configured, `.py` files of installed packages and/or application will be compiled to `.pyc` files. All files, except `build` directory will be added to a package asset.
* Runs `flutter build <target_platform>` command to produce an executable or an install package.
* Copies build results to `{flet_app_directory}/build/<target_platform>` directory.

## Including Extensions

If your app uses Flet extensions (third-party packages), simply add them to your project's dependencies so they will be included in the packaged app:

```toml
dependencies = [
  "flet-extension",
  "flet",
]
```

If the extension has not been published on PyPi yet, you can reference it from alternative sources:

- Git Repository:
  ```toml
  dependencies = [
    "flet-extension @ git+https://github.com/account/flet-extension.git",
    "flet",
  ]
  ```


- Local Package: 
  ```toml
  dependencies = [
    "flet-extension @ file:///path/to/flet-extension",
    "flet",
  ]
  ```

Example of extensions can be found here.

## Flutter Dependencies

Adding a Flutter package can be done in the `pyproject.toml` as follows:

```toml
[tool.flet]
flutter.dependencies = ["package_1", "package_2"]

# OR

[tool.flet.flutter.dependencies]
package_1 = "x.y.z"
package_2 = "x.y.z"

# OR

[tool.flet.flutter.dependencies.local_package]
path = "/path/to/local_package"
```

## Output Directory

By default, the build output is saved in the `<python_app_directory>/build/<target_platform>` directory. 

You can specify a custom output directory using the `--output` option in the `flet build` command:

- via Command Line:
  ```bash
  flet build <target_platform> --output <path-to-output-dir>
  ```

- via `pyproject.toml`:  # fixme: build.py doesnt have this
  ```toml
  [tool.flet]
  output = "<path-to-output-dir>"
  ```

## Icons

You can customize app icons for all platforms (except Linux) using image files placed in the `assets` directory of your Flet app.

If a platform-specific icon (as in the table below) is not provided, `icon.png` (or any supported format like `.bmp`, `.jpg`, or `.webp`) will be used as fallback. For the iOS platform, transparency (alpha channel) will be automatically removed, if present.

| Platform | File Name                            | Recommended Size     | Notes                                                                 |
|----------|---------------------------------------|----------------------|-----------------------------------------------------------------------|
| iOS      | `icon_ios.png`                        | ≥ 1024×1024 px       | Transparency (alpha channel) is not supported and will be automatically removed if present. |
| Android  | `icon_android.png`                    | ≥ 192×192 px         |                                                                       |
| Web      | `icon_web.png`                        | ≥ 512×512 px         |                                                                       |
| Windows  | `icon_windows.ico` or `icon_windows.png` | 256×256 px           | `.png` file will be interally converted to a 256×256 px `.ico` icon.           |
| macOS    | `icon_macos.png`                      | ≥ 1024×1024 px       |                                                                       |


## Splash screen

You can customize splash screens for iOS, Android, and Web platforms by placing image files in the `assets` directory of your Flet app.

If platform-specific splash images are not provided, Flet will fall back to `splash.png`. If that is also missing, it will use `icon.png` or any supported format such as `.bmp`, `.jpg`, or `.webp`.

### Platform-Specific Splash Images

| Platform | Light Mode File         | Dark Mode File              | Fallback Order                                                                 |
|----------|--------------------------|------------------------------|--------------------------------------------------------------------------------|
| iOS      | `splash_ios.png`         | `splash_dark_ios.png`        | → Light splash → `splash_dark.png` → `splash.png` → `icon.png`                |
| Android  | `splash_android.png`     | `splash_dark_android.png`    | → Light splash → `splash_dark.png` → `splash.png` → `icon.png`                |
| Web      | `splash_web.png`         | `splash_dark_web.png`        | → Light splash → `splash_dark.png` → `splash.png` → `icon.png`                |

### Splash Background Colors

You can customize splash background colors using the following options:

- **Splash Color:** Background color for light mode splash screens (defaults to `#ffffff`)




- **Splash Dark Color:** Background color for dark mode splash screens (defaults to `#333333`)

  - via Command Line:
    ```bash
    # Light Color
    flet build <target_platform> --splash-color #ffffff

    # Dark Color
    flet build <target_platform> --splash-dark-color #333333
    ```

  - via `pyproject.toml`:
    ```toml
    [tool.flet]
    splash.color = "#ffffff"

    # OR

    [tool.flet.splash]
    color = "#ffffff"
    ```

### Configuration via `pyproject.toml`

You can also configure splash settings in your `pyproject.toml`:

```toml
[tool.flet.splash]
color = "#FFFF00" # --splash-color
dark_color = "#8B8000" # --splash-dark-color
web = false # --no-web-splash
ios = false # --no-ios-splash
android = false # --no-android-splash
```

## Boot screen

Boot screen is shown while the archive with Python app is being unpacked to a device file system.
It's shown after splash screen and before startup screen. App archive does not include 3rd-party site packages.
If the archive is small and its unpacking is fast you can keep that screen disabled (default).

To enable boot screen in `pyproject.toml` for all target platforms:

```toml
[tool.flet.app.boot_screen]
show = true
message = "Preparing the app for its first launch…"
```

Boot screen can be enabled for specific platforms only or its message customized. For example, enabling it for Android only:

```toml
[tool.flet.android.app.boot_screen]
show = true
```

## Startup screen

Startup screen is shown while the archive (app.zip) with 3rd-party site packages (Android only) is being unpacked and Python app is starting. Startup screen is shown after boot screen.

To enable startup screen in `pyproject.toml` for all target platforms:

```toml
[tool.flet.app.startup_screen]
show = true
message = "Starting up the app…"
```

Startup screen can be enabled for specific platforms only or its message customized. For example, enabling it for Android only:

```toml
[tool.flet.android.app.startup_screen]
show = true
```

## Entry point

The Flet application entry (or starting) point refers to the file that contains the call to `ft.run(target)`. 

By default, Flet assumes this file is named `main.py`. However, if your entry point is different (for example, `start.py`), you can specify it using one of the following methods:

- via Command Line:
  ```bash
  flet build <target_platform> --module-name start.py
  ```

- via `pyproject.toml`:
  ```toml
  [tool.flet]
  app.module = "start.py"

  # OR

  [tool.flet.app]
  module = "start.py"
  ```

## Compilation and cleanup

By default, Flet does **not** compile your app files during packaging. This allows the build process to complete even if there are syntax errors, which can be useful for debugging or rapid iteration.

* `compile-app`: compile app's `.py` files
* `compile-packages`: compile site/installed packages' `.py` files
* `cleanup-packages`: remove unnecessary package files upon successful compilation

Enable one or more of them as follows:

- From the build command as flags:
  ```bash
  flet build linux --compile-app --compile-packages --cleanup-packages
  ```

- In the `pyproject.toml`:
  ```toml
  [tool.flet]
  compile.app = true
  compile.packages = true
  compile.cleanup = true

  # OR

  [tool.flet.compile]
  app = true
  packages = true
  cleanup = true
  ```

## Permissions

`flet build` command allows granular control over permissions, features and entitlements embedded into `AndroidManifest.xml`, `Info.plist` and `.entitlements` files.

See platform guides for setting specific [iOS](/docs/publish/ios), [Android](/docs/publish/android) and [macOS](/docs/publish/macos) permissions.

### Cross-platform permissions

There are pre-defined permissions that mapped to `Info.plist`, `*.entitlements` and `AndroidManifest.xml` for respective platforms.

Setting cross-platform permissions:

```
flet build --permissions permission_1 permission_2 ...
```

Supported permissions:

* `location`
* `camera`
* `microphone`
* `photo_library`

#### iOS mapping to `Info.plist` entries

* `location`
  * `NSLocationWhenInUseUsageDescription = This app uses location service when in use.`
  * `NSLocationAlwaysAndWhenInUseUsageDescription = This app uses location service.`
* `camera`
  * `NSCameraUsageDescription = This app uses the camera to capture photos and videos.`
* `microphone`
  * `NSMicrophoneUsageDescription = This app uses microphone to record sounds.`
* `photo_library`
  * `NSPhotoLibraryUsageDescription = This app saves photos and videos to the photo library.`

#### macOS mapping to entitlements

* `location`
  * `com.apple.security.personal-information.location = True`
* `camera`
  * `com.apple.security.device.camera = True`
* `microphone`
  * `com.apple.security.device.audio-input = True`
* `photo_library`
  * `com.apple.security.personal-information.photos-library = True`

#### Android mappings

* `location`
  * permissions:
    * `android.permission.ACCESS_FINE_LOCATION": True`
    * `android.permission.ACCESS_COARSE_LOCATION": True`
    * `android.permission.ACCESS_BACKGROUND_LOCATION": True`
  * features:
    * `android.hardware.location.network": False`
    * `android.hardware.location.gps": False`
* `camera`
  * permissions:
    * `android.permission.CAMERA": True`
  * features:
    * `android.hardware.camera": False`
    * `android.hardware.camera.any": False`
    * `android.hardware.camera.front": False`
    * `android.hardware.camera.external": False`
    * `android.hardware.camera.autofocus": False`
* `microphone`
  * permissions:
    * `android.permission.RECORD_AUDIO": True`
    * `android.permission.WRITE_EXTERNAL_STORAGE": True`
    * `android.permission.READ_EXTERNAL_STORAGE": True`
* `photo_library`
  * permissions:
    * `android.permission.READ_MEDIA_VISUAL_USER_SELECTED": True`

Configuring cross-platform permissions in `pyproject.toml`:

```toml
[tool.flet]
permissions = ["camera", "microphone"]
```

## Versioning

### Build Number
An integer identifier (defaults to `1`) used internally to distinguish one build from another. Each new build must have a unique, incrementing number; higher numbers indicate more recent builds. It's value can be set as follows:

- via Command Line: 
  ```bash
  flet build apk --build-number 1
  ```

- via `pyproject.toml`:
  ```toml
  [tool.flet]
  build_number = 1
  ```

### Build Version 
A user‑facing version string in `x.y.z` format (defaults to `1.0.0`). Increment this for each new release to differentiate it from previous versions. It's value can be set as follows:

- via Command Line: 
  ```bash
  flet build apk --build-version 1.0.0
  ```

- via `pyproject.toml`:
  ```toml
  [project]
  version = "1.0.0"

  # OR

  [tool.poetry]
  version = "1.0.0"
  ```

## Customizing build template

By default, `flet build` creates a temporary Flutter project using a [cookiecutter](https://cookiecutter.readthedocs.io/en/stable/) template from the flet-dev/flet-build-template repository. The version of the template used is determined by the [template reference](#template-reference) option, which defaults to the current Flet version.

You can customize this behavior by specifying your own template source, reference, and subdirectory.

### Template Source

Defines the location of the template to be used. Defaults to `gh:flet-dev/flet-build-template`, the [official Flet template](https://github.com/flet-dev/flet-build-template).

Valid values include:

- A GitHub repository using the `gh:` prefix (e.g., `gh:org/template`)
- A full Git URL (e.g., `https://github.com/org/template.git`)
- A local directory path

It's value can be set in either of the following ways:

- via Command Line: 
  ```bash
  flet build apk --template gh:flet-dev/flet-build-template
  ```

- via `pyproject.toml`:
  ```toml
  [tool.flet.template]
  url = "gh:flet-dev/flet-build-template"
  ```

### Template Reference

Defines the branch, tag, or commit to check out from the [template source](#template-source). Defaults to the version of Flet installed.

It's value can be set in either of the following ways:

- via Command Line: 
  ```bash
  flet build apk --template-ref main
  ```

- via `pyproject.toml`:
  ```toml
  [tool.flet.template]
  ref = "main"
  ```


### Template Directory

Defines the relative path to the cookiecutter template. If [template source](#template-source) is set, the path is treated as a subdirectory within its root; otherwise, it is relative to`<user-directory>/.cookiecutters/flet-build-template`.

It's value can be set in either of the following ways:

- via Command Line: 
  ```bash
  flet build apk --template gh:org/template --template-dir sub/directory
  ```

- via `pyproject.toml`:
  ```toml
  [tool.flet.template]
  url = "gh:org/template"
  dir = "sub/directory"
  ```

## Additional `flutter build` Arguments

During the `flet build` process, `flutter build` command gets called internally to package your app for the specified platform.

It's value can be set in either of the following ways:

- via Command Line (can be used multiple times): 
  ```bash
  flet build <target_platform> --flutter-build-args=--no-tree-shake-icons

  # OR, with value

  flet build <target_platform> --flutter-build-args=--export-method --flutter-build-args=development
  ```

- via `pyproject.toml`:
  ```toml
  [tool.flet]
  flutter.build_args = [
    "--no-tree-shake-icons",
    "--export-method", "development"
  ]

  # OR

  [tool.flet.flutter]
  build_args = [
    "--no-tree-shake-icons",
    "--export-method", "development"
  ]
  ```

## Verbose logging

The `-v` (or `--verbose`) and `-vv` flags enables detailed output from all commands during the flet build process.
Use `-v` for standard/basic verbose logging, or `-vv` for even more detailed output (higher verbosity level).
If you need support, we may ask you to share this verbose log.

## Console output

All output from Flet apps—such as `print()` statements, `sys.stdout.write()` calls, and messages from the Python logging module—is now redirected to a `console.log` file. The full path to this file is available via the `FLET_APP_CONSOLE` environment variable.

The log file is written in an unbuffered manner, allowing you to read it at any point in your Python program using:

```python
with open(os.getenv("FLET_APP_CONSOLE"), "r") as f:
  log = f.read()
```

You can then display the `log` content using an `AlertDialog` or any other Flet control.

If your program calls sys.exit(100), the complete log will automatically be shown in a scrollable window. This is a special “magic” exit code for debugging purposes:

```python
import sys
sys.exit(100)
```

Calling `sys.exit()` with any other code will terminate the app without displaying the log.
