import Tab from '../tab'
const { __ } = wp.i18n

const Tabs = (props) => {
    return (
        <div className='nav-tab-wrapper give-nav-tab-wrapper'>
            <Tab to='/'>
                Overview
            </Tab>
    <a className='nav-tab' href={giveReportsData.legacyReportsUrl}>{__('Legacy Reports Page', 'give')}</a>
        </div>
    )
}
export default Tabs