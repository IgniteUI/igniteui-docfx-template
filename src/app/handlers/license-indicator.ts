import localization from '../services/localization';

export const attachLicenseIndicatorHandler = () => {
    const licenseIndicator = document.querySelector('.license-indicator');
    if (!licenseIndicator) return;

    const meta = document.querySelector('meta[property="docfx:license"]');
    const license = meta?.getAttribute('content')?.toLowerCase();

    const label = licenseIndicator.querySelector('.license-label');
    if (!license || !label) return;

    const licenseTypeMap: Record<string, 'opensource' | 'premium'> = {
        'mit': 'opensource',
        'oss': 'opensource',
        'commercial': 'premium',
        'premium': 'premium'
    };

    const licenseType = licenseTypeMap[license];

    if (licenseType) {
        const localizedText = localization.localize('license', licenseType);

        label.textContent = localizedText;
        licenseIndicator.classList.add(`license-${licenseType}`);
    }
};
