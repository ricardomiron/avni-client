import PropTypes from 'prop-types';
import React from "react";
import Path from "../framework/routing/Path";
import IndividualSearchView from "./individual/IndividualSearchView";
import MenuView from "./MenuView";
import CHSContainer from "./common/CHSContainer";
import AvniIcon from "./common/AvniIcon";
import CHSNavigator from "../utility/CHSNavigator";
import AuthService from "../service/AuthService";
import bugsnag from "../utility/bugsnag";
import General from "../utility/General";
import {LandingViewActionsNames as Actions} from "../action/LandingViewActions";
import Reducers from "../reducer";
import Styles from "./primitives/Styles";
import MyDashboardView from "./mydashbaord/MyDashboardView";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import EntityService from "../service/EntityService";
import {SubjectType} from "avni-models";
import _ from "lodash";
import Colors from "./primitives/Colors";
import RegisterView from "./RegisterView";
import AbstractComponent from "../framework/view/AbstractComponent";
import MCIIcon from "react-native-vector-icons/MaterialCommunityIcons";
import EntypoIcon from "react-native-vector-icons/Entypo";
import PrivilegeService from "../service/PrivilegeService";
import CustomFilterService from "../service/CustomFilterService";
import CustomDashboardView from "./customDashboard/CustomDashboardView";
import CustomDashboardService from "../service/customDashboard/CustomDashboardService";
import NewsService from "../service/news/NewsService";
import {CustomDashboardActionNames} from "../action/customDashboard/CustomDashboardActions";
import LocalCacheService from '../service/LocalCacheService';


@Path('/landingView')
class LandingView extends AbstractComponent {
    static propTypes = {
        menuProps: PropTypes.object
    };

    constructor(props, context) {
        super(props, context, Reducers.reducerKeys.landingView);
    }

    viewName() {
        return "LandingView";
    }

    UNSAFE_componentWillMount() {
        LocalCacheService.getPreviouslySelectedSubjectTypeUuid().then(cachedSubjectTypeUUID => {
            this.dispatchAction(Actions.ON_LOAD, {cachedSubjectTypeUUID});
        });
        const authService = this.context.getService(AuthService);
        authService.getAuthProviderService().getUserName().then(username => {
            bugsnag.setUser(username, username, username);
        });

        return super.UNSAFE_componentWillMount();
    }

    didFocus() {
        this.refreshCustomDashboardsCounts();
    }

    refreshCustomDashboardsCounts() {
        this.dispatchAction(CustomDashboardActionNames.REMOVE_OLDER_COUNTS);
        setTimeout(() => this.dispatchAction(CustomDashboardActionNames.REFRESH_COUNT), 500);
    }

    renderBottomBarIcons(icon, menuMessageKey, pressHandler, isSelected, idx) {
        return _.isNil(menuMessageKey) ? null :
            (<View key={idx} style={[{
                alignItems: 'center',
                flexDirection: 'column',
            }, isSelected && {borderBottomWidth: 2, borderColor: Colors.iconSelectedColor, marginBottom: 1}]}>
                <TouchableOpacity style={{height: 35, width: 35}} onPress={pressHandler}>
                    {icon}
                </TouchableOpacity>
                <Text style={{
                    fontSize: Styles.smallerTextSize,
                    fontStyle: 'normal',
                    color: isSelected ? Colors.iconSelectedColor : Colors.bottomBarIconColor,
                    lineHeight: 12,
                    alignSelf: 'center', paddingTop: 3
                }}>{menuMessageKey}</Text>
            </View>);
    }

    Icon(iconName, iconStyle, isSelected, renderDot = false) {
        const style = iconStyle ? (isSelected ? {
            ...iconStyle,
            color: Colors.iconSelectedColor
        } : iconStyle) : MenuView.iconStyle;
        return renderDot ? this.IconWithDot(iconName, style) : <AvniIcon name={iconName} style={style} type='MaterialCommunityIcons'/>
    }

    IconWithDot(iconName, iconStyle) {
        return <View style={{flexDirection: 'row', flex: 1}}>
            <MCIIcon name={iconName} style={[iconStyle, {fontSize: 30}]}/>
            <EntypoIcon name={'dot-single'}
                        style={{fontSize: 25, color: Colors.BadgeColor, position: 'absolute', top: -6, right: -6}}/>
        </View>
    }

    static barIconStyle = {color: Colors.bottomBarIconColor, opacity: 0.8, alignSelf: 'center', fontSize: 33};

    renderCustomDashboard(startSync) {
        return <CustomDashboardView
            startSync={startSync && this.state.syncRequired}
            icon={(name, style) => this.Icon(name, style)}
            title={'home'}
            hideBackButton={true}
            renderSync={true}
            onlyPrimary={true}
        />
    }

    renderDefaultDashboard(startSync) {
        return <MyDashboardView
            startSync={startSync && this.state.syncRequired}
            icon={(name, style) => this.Icon(name, style)}/>
    }

    renderDashboard(startSync) {
        const renderCustomDashboard = this.getService(CustomDashboardService).isCustomDashboardMarkedPrimary();
        return renderCustomDashboard ? this.renderCustomDashboard(startSync) : this.renderDefaultDashboard(startSync);
    }

    render() {
        General.logDebug("LandingView", "render");
        const displayRegister = this.context.getService(PrivilegeService).displayRegisterButton();
        const startSync = _.isNil(this.props.menuProps) ? false : this.props.menuProps.startSync;
        const subjectTypes = this.context.getService(EntityService).findAll(SubjectType.schema.name)
        const previouslySelectedSubjectType = LocalCacheService.getPreviouslySelectedSubjectType(subjectTypes, this.state.previouslySelectedSubjectTypeUUID);
        const registerIcon = _.isEmpty(subjectTypes) ? 'plus-box' : previouslySelectedSubjectType.registerIcon();
        const hideSearch = this.context.getService(CustomFilterService).hideSearchButton();
        const renderDot = this.getService(NewsService).isUnreadMoreThanZero();
        const registerMenuItem = displayRegister ? [this.Icon(registerIcon, LandingView.barIconStyle, this.state.register), this.I18n.t("register"),
            previouslySelectedSubjectType && (() => this.dispatchAction(Actions.ON_REGISTER_CLICK)), this.state.register] : [];
        const searchMenuItem = !hideSearch ? [this.Icon("magnify", LandingView.barIconStyle, this.state.search), this.I18n.t("search"),
            () => this.dispatchAction(Actions.ON_SEARCH_CLICK), this.state.search] : [];
        const bottomBarIcons = [
            [this.Icon("home", LandingView.barIconStyle, this.state.home), this.I18n.t("home"), () => this.dispatchAction(Actions.ON_HOME_CLICK), this.state.home],
            registerMenuItem,
            searchMenuItem,
            [this.Icon("menu", LandingView.barIconStyle, this.state.menu, renderDot), this.I18n.t("More"), () => this.dispatchAction(Actions.ON_MENU_CLICK), this.state.menu]
        ];

        return (
            <CHSContainer>
                {this.state.home && this.renderDashboard(startSync) }
                {this.state.search && <IndividualSearchView
                    onIndividualSelection={(source, individual) => CHSNavigator.navigateToProgramEnrolmentDashboardView(source, individual.uuid)}
                    buttonElevated={true}
                    hideBackButton={true}/>}
                {this.state.register && <RegisterView hideBackButton={true}/>}
                {this.state.menu && <MenuView menuIcon={(name, style) => this.Icon(name, style)}/>}
                {this.state.dashboard && <CustomDashboardView hideBackButton={true}/>}

                <View style={{
                    height: 55,
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    backgroundColor: Colors.bottomBarColor,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    elevation: 3,
                    alignItems: 'center',
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: Colors.Separator
                }}>

                    {bottomBarIcons.map(([icon, display, cb, isSelected], idx) => this.renderBottomBarIcons(icon, display, cb, isSelected, idx))}
                </View>
            </CHSContainer>
        );
    }
}

export default LandingView;
