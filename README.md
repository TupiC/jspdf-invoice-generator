# PDF Invoice Generator

An PDF generator that lets you create and customize an invoice based on an object using the `jsPDF` library. The `jsPDF` library is also exported, allowing it to be used without needing to import `jsPDF` separately. I created this project to have more options for customizing the invoice and to make it easier to use the `jsPDF` library. This project is inspired by Edison Neza's jspdf-invoice-template.

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/TupiC/jspdf-invoice-generator?include_prereleases)](https://img.shields.io/github/v/release/TupiC/jspdf-invoice-generator?include_prereleases)
[![GitHub last commit](https://img.shields.io/github/last-commit/TupiC/jspdf-invoice-generator)](https://img.shields.io/github/last-commit/TupiC/jspdf-invoice-generator)
[![GitHub issues](https://img.shields.io/github/issues-raw/TupiC/jspdf-invoice-generator)](https://img.shields.io/github/issues-raw/TupiC/jspdf-invoice-generator)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/TupiC/jspdf-invoice-generator)](https://img.shields.io/github/issues-pr/TupiC/jspdf-invoice-generator)
[![GitHub](https://img.shields.io/github/license/TupiC/jspdf-invoice-generator)](https://img.shields.io/github/license/TupiC/jspdf-invoice-generator)

# Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [Contribute](#contribute)
-   [Development](#development)
-   [License](#license)

# Installation

Installing the packing with npm:

```shell
npm i jspdf-invoice-generator
```

# Usage

```javascript
import { generateInvoice } from "jspdf-invoice-generator";

generateInvoice(invoiceProps);
```

# Contribute

If you want to contribute to this project and make it better your help is very welcome. Either by creating a PR or suggesting new ideas.

# Development

Feel free to test and run this project in your environment.

```shell
git clone https://github.com/TupiC/jspdf-invoice-generator.git
cd jspdf-invoice-generator
npm install
npm run dev
```

# License

Copyright (c) 2024 Christoph Tupi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

<details>
<summary>Credits</summary>
Copyright (c) 2022 Edison Neza, https://github.com/edisonneza/jspdf-invoice-template

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

</details>
