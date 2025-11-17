interface ILocalizationKeys {
    [key: string]: {
        [key: string]: {
            [key: string]: string
        }
    };
}

class LocalizationService {
    public data: ILocalizationKeys = {
        "English": {
            "angular": {
                "gridsBarText": "Want the Fastest Angular Data Grid on the Market? We’ve Got It! Quickly Bind Data with Minimal Code Involved.",
                "gridsBarButtonText": "Get Started",
                "gridsButtonXdGaLabelValue": 'Help_AngularGrids_Trial',
                "gridsButtonGaLabelValue": 'Hello bar – Help_AngularGrids_Trial',
                "chartsBarText": 'Ignite UI Angular Charts: Build Expressive Dashboards and Render Data Points with 65+ Real-Time Angular Charts.',
                "chartsBarButtonText": 'Start Free Trial',
                "chartsButtonXdGaLabelValue": 'Help_AngularCharts_Trial',
                "chartsButtonGaLabelValue": 'Hello bar – Help_AngularCharts_Trial',
                "ctaGenericText": "60+ components, flexible API, powerful theming and branding capabilities, and a {{actionText}} with the speed and functionalities you require.",
                "ctaGenericActionText": "rich feature set for building Angular apps",
                "ctaGridText": "The {{actionText}}, offering paging, sorting, filtering, grouping, exporting to PDF and Excel, and more. Everything you need for the ultimate app building experience and data manipulation.",
                "ctaGridActionText": "fastest, feature-rich Angular Data Grid",
                "ctaChartText": "Render millions of data points and build your visualizations with {{actionText}}. This is the most extensive chart library for any application scenario.",
                "ctaChartActionText": "60+ real-time Angular charts",
            },
            "appbuilder": {
                "barText": 'App Builder™ Includes a Full Design System with 60+ UI Controls and Code Generation for Angular & Blazor!',
                "barButtonText": 'Start Free Trial',
                "buttonXdGaLabelValue": 'Help_ABTrial',
                "buttonGaLabelValue": 'Hello bar – Help_ABTrial',
            },
            "blazor": {
                "gridsBarText": 'Ignite UI for Blazor: Feature-Rich, Lightweight Tables & Data Grids to Modernize Your Apps!',
                "gridsBarButtonText": 'Try It Free',
                "gridsButtonXdGaLabelValue": 'Help_BlazorCharts_Trial',
                "gridsButtonGaLabelValue": 'Hello bar – Help_BlazorCharts_Trial',
                "chartsBarText": 'Create Charts & Dashboards for Your Modern C# Blazor Web and Mobile Apps with Over 65 High-Performing Charts & Graphs in Ignite UI!',
                "chartsBarButtonText": 'Try It Free',
                "chartsButtonXdGaLabelValue": 'Help_BlazorCharts_Trial',
                "chartsButtonGaLabelValue": 'Hello bar – Help_BlazorCharts_Trial',
                "ctaGenericText": "Build modern web experiences with {{actionText}}, including the fastest Data Grid, high-performance Charts, a full set of ready-to-use features, and more.",
                "ctaGenericActionText": "60+ reusable components",
                "ctaGridText": "A {{actionText}}, covering everything from paging, sorting, filtering, editing, grouping to virtualization on rows and columns, and beyond. No limits for .NET developers.",
                "ctaGridActionText": "full set of ready-to-use features",
                "ctaChartText": "Transform raw data into stunning visualizations and ensure the best UX, {{actionText}} and graphs optimized for Blazor WebAssembly and Blazor Server.",
                "ctaChartActionText": "using 60+ high-performance charts",
            },
            "hljs": {
                "copyCode": "COPY CODE",
                "codeCopied": "COPIED"
            },
            "sideaffix": {
                "title": "IN THIS ARTICLE",
                "tryNow": "Try Now For Free"
            },
            "noteBlocks": {
                "note": "NOTE",
                "warning": "WARNING",
                "tip": "TIP",
                "important": "IMPORTANT",
                "caution": "CAUTION"
            },
            "license": {
                "opensource": "Package: Open Source",
                "premium": "Package: Premium"
            }
        },
        "Japanese": {
            "angular": {
                "gridsBarText": "市場で最速の Angular Data Grid が必要なら、私たちにお任せください! 最小限のコードでデータをすばやくバインドします。",
                "gridsBarButtonText": "使用開始",
                "gridsButtonXdGaLabelValue": 'Help_AngularGrids_Trial',
                "gridsButtonGaLabelValue": 'Hello bar – Help_AngularGrids_Trial',
                "chartsBarText": 'Ignite UI Angular チャート: 表現力豊かなダッシュボードを構築し、65 以上のリアルタイム Angular チャートを使用してデータ ポイントをレンダリングします。',
                "chartsBarButtonText": '無償トライアル版の開始',
                "chartsButtonXdGaLabelValue": 'Help_AngularCharts_Trial',
                "chartsButtonGaLabelValue": 'Hello bar – Help_AngularCharts_Trial',
                "ctaGenericText": "60 以上のコンポーネント、柔軟な API、強力なテーマ設定およびブランディング機能、必要な速度と機能を備えた {{actionText}}。",
                "ctaGenericActionText": "Angular アプリケーションを構築するための豊富な機能セット",
                "ctaGridText": "{{actionText}} は、ページング、ソート、フィルタリング、グループ化、PDF および Excel へのエクスポートなどの機能を提供します。究極のアプリ構築エクスペリエンスとデータ操作に必要なすべてが揃っています。",
                "ctaGridActionText": "最速で機能豊富な Angular Data Grid",
                "ctaChartText": "{{actionText}} を使用して、何百万ものデータ ポイントを描画し、視覚化を構築します。これは、あらゆるアプリケーション シナリオに対応する最も広範なチャート ライブラリです。",
                "ctaChartActionText": "60 以上のリアルタイム Angular チャート",
            },
            "appbuilder": {
                "barText": 'App Builder™ には、Angular と Blazor 用の 60 以上の UI コントロールとコード生成を備えた完全なデザイン システムが含まれています!',
                "barButtonText": '無償トライアル版の開始',
                "buttonXdGaLabelValue": 'Help_ABTrial',
                "buttonGaLabelValue": 'Hello bar – Help_ABTrial',
            },
            "blazor": {
                "gridsBarText": 'Ignite UI for Blazor: アプリをモダナイズする機能豊富で軽量なテーブルとデータ グリッド!',
                "gridsBarButtonText": '無料で試してみる',
                "gridsButtonXdGaLabelValue": 'Help_BlazorCharts_Trial',
                "gridsButtonGaLabelValue": 'Hello bar – Help_BlazorCharts_Trial',
                "chartsBarText": 'Ignite UI の 65 を超える高性能チャートとグラフを使用して、最新の C# Blazor Web およびモバイル アプリ用のチャートとダッシュボードを作成します!',
                "chartsBarButtonText": '無料で試してみる',
                "chartsButtonXdGaLabelValue": 'Help_BlazorCharts_Trial',
                "chartsButtonGaLabelValue": 'Hello bar – Help_BlazorCharts_Trial',
                "ctaGenericText": "最速のデータ グリッド、高性能なチャート、すぐに使用できる機能のフルセットなどを含む {{actionText}} を使用して、最新の Web エクスペリエンスを構築します。",
                "ctaGenericActionText": "60 以上の再利用可能なコンポーネント",
                "ctaGridText": "{{actionText}} は、ページング、ソート、フィルタリング、編集、グループ化から行と列の仮想化まで、あらゆる機能をカバーします。.NET 開発者には制限はありません。",
                "ctaGridActionText": "すぐに使用できる機能のフルセット",
                "ctaChartText": "Blazor WebAssembly および Blazor Server 向けに最適化された {{actionText}} とグラフを使用して、生データを魅力的な視覚化に変換し、最高の UX を実現します。",
                "ctaChartActionText": "60 以上の高性能チャートを使用",
            },
            "hljs": {
                "copyCode": "コピー",
                "codeCopied": "コピー済み"
            },
            "sideaffix": {
                "title": "トピック コンテンツ:",
                "tryNow": "無料で試してみる"
            },
            "noteBlocks": {
                "note": "注",
                "warning": "警告",
                "tip": "ヒント",
                "important": "重要な情報",
                "caution": "注意"
            },
            "license": {
                "opensource": "パッケージ: オープンソース",
                "premium": "パッケージ: プレミアム"
            }
        }
    };

    public localize(type: string, key: string) {
        let langKey = "English";
        const htmlLang = $('html')[0].lang;
        if (htmlLang === 'ja') {
            langKey = "Japanese";
        }
        return this.data[langKey][type][key];
    }
}

const localization = new LocalizationService();
export default localization;