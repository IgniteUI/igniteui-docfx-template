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
            "angularGrids": {
                "barText": "Want the Fastest Angular Data Grid on the Market? We’ve Got It! Quickly Bind Data with Minimal Code Involved.",
                "barButtonText": "Get Started",
                "buttonXdGaLabelValue": 'Help_AngularGrids_Trial',
                "buttonGaLabelValue": 'Hello bar – Help_AngularGrids_Trial',
            },
            "angularCharts": {
                "barText": 'Ignite UI Angular Charts: Build Expressive Dashboards and Render Data Points with 65+ Real-Time Angular Charts.',
                "barButtonText": 'Start Free Trial',
                "buttonXdGaLabelValue": 'Help_AngularCharts_Trial',
                "buttonGaLabelValue": 'Hello bar – Help_AngularCharts_Trial',
            },
            "appbuilder": {
                "barText": 'App Builder™ Includes a Full Design System with 60+ UI Controls and Code Generation for Angular & Blazor!',
                "barButtonText": 'Start Free Trial',
                "buttonXdGaLabelValue": 'Help_ABTrial',
                "buttonGaLabelValue": 'Hello bar – Help_ABTrial',
            },
            "blazorCharts": {
                "barText": 'Create Charts & Dashboards for Your Modern C# Blazor Web and Mobile Apps with Over 65 High-Performing Charts & Graphs in Ignite UI!',
                "barButtonText": 'Try It Free',
                "buttonXdGaLabelValue": 'Help_BlazorCharts_Trial',
                "buttonGaLabelValue": 'Hello bar – Help_BlazorCharts_Trial',
            },
            "blazorGrids": {
                "barText": 'Ignite UI for Blazor: Feature-Rich, Lightweight Tables & Data Grids to Modernize Your Apps!',
                "barButtonText": 'Try It Free',
                "buttonXdGaLabelValue": 'Help_BlazorCharts_Trial',
                "buttonGaLabelValue": 'Hello bar – Help_BlazorCharts_Trial'
            },
            "hljs": {
                "copyCode": "COPY CODE",
                "codeCopied": "COPIED"
            },
            "sideaffix": {
                "title": "IN THIS ARTICLE"
            },
            "noteBlocks": {
                "note": "NOTE",
                "warning": "WARNING",
                "tip": "TIP",
                "important": "IMPORTANT",
                "caution": "CAUTION"
            }
        },
        "Japanese": {
            "angularGrids": {
                "barText": "市場で最速の Angular Data Grid が必要なら、私たちにお任せください! 最小限のコードでデータをすばやくバインドします。",
                "barButtonText": "使用開始",
                "buttonXdGaLabelValue": 'Help_AngularGrids_Trial',
                "buttonGaLabelValue": 'Hello bar – Help_AngularGrids_Trial',
            },
            "angularCharts": {
                "barText": 'Ignite UI Angular チャート: 表現力豊かなダッシュボードを構築し、65 以上のリアルタイム Angular チャートを使用してデータ ポイントをレンダリングします。',
                "barButtonText": '無償トライアル版の開始',
                "buttonXdGaLabelValue": 'Help_AngularCharts_Trial',
                "buttonGaLabelValue": 'Hello bar – Help_AngularCharts_Trial',
            },
            "appbuilder": {
                "barText": 'App Builder™ には、Angular と Blazor 用の 60 以上の UI コントロールとコード生成を備えた完全なデザイン システムが含まれています!',
                "barButtonText": '無償トライアル版の開始',
                "buttonXdGaLabelValue": 'Help_ABTrial',
                "buttonGaLabelValue": 'Hello bar – Help_ABTrial',
            },
            "blazorCharts": {
                "barText": 'Ignite UI の 65 を超える高性能チャートとグラフを使用して、最新の C# Blazor Web およびモバイル アプリ用のチャートとダッシュボードを作成します!',
                "barButtonText": '無料で試してみる',
                "buttonXdGaLabelValue": 'Help_BlazorCharts_Trial',
                "buttonGaLabelValue": 'Hello bar – Help_BlazorCharts_Trial',
            },
            "blazorGrids": {
                "barText": 'Ignite UI for Blazor: アプリをモダナイズする機能豊富で軽量なテーブルとデータ グリッド!',
                "barButtonText": '無料で試してみる',
                "buttonXdGaLabelValue": 'Help_BlazorCharts_Trial',
                "buttonGaLabelValue": 'Hello bar – Help_BlazorCharts_Trial'
            },
            "hljs": {
                "copyCode": "コピー",
                "codeCopied": "コピー済み"
            },
            "sideaffix": {
                "title": "トピック コンテンツ:"
            },
            "noteBlocks": {
                "note": "注",
                "warning": "警告",
                "tip": "ヒント",
                "important": "重要な情報",
                "caution": "注意"
            }
        }
    };

    public localize(type: string, key: string) {
        let langKey = "English";
        if ($('html')[0].lang !== 'en') {
            langKey = "Japanese";
        }
        return this.data[langKey][type][key];
    }
}

const localization = new LocalizationService();
export default localization;