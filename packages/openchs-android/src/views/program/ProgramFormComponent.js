import {StyleSheet, View} from "react-native";
import React, {Component} from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import AppHeader from "../common/AppHeader";
import IndividualProfile from "../common/IndividualProfile";
import themes from "../primitives/themes";
import {Actions} from "../../action/program/ProgramEnrolmentActions";
import StaticFormElement from "../viewmodel/StaticFormElement";
import DateFormElement from "../form/formElement/DateFormElement";
import FormElementGroup from "../form/FormElementGroup";
import WizardButtons from "../common/WizardButtons";
import {PrimitiveValue, ProgramEnrolment} from "openchs-models";
import AbstractDataEntryState from "../../state/AbstractDataEntryState";
import CHSNavigator from "../../utility/CHSNavigator";
import ProgramEnrolmentState from '../../action/program/ProgramEnrolmentState';
import Distances from "../primitives/Distances";
import CHSContainer from "../common/CHSContainer";
import CHSContent from "../common/CHSContent";
import FormMappingService from "../../service/FormMappingService";
import GeolocationFormElement from "../form/formElement/GeolocationFormElement";

class ProgramFormComponent extends AbstractComponent {
    static propTypes = {
        context: React.PropTypes.object.isRequired,
        state: React.PropTypes.object.isRequired,
        backFunction: React.PropTypes.func.isRequired,
        editing: React.PropTypes.bool.isRequired
    };

    next() {
        this.dispatchAction(Actions.NEXT, {
            completed: (state, decisions, ruleValidationErrors, checklists, nextScheduledVisits) => {
                const observations = this.props.context.usage === ProgramEnrolmentState.UsageKeys.Enrol ? state.enrolment.observations : state.enrolment.programExitObservations;
                const onSaveCallback = (source) => {
                    CHSNavigator.navigateToProgramEnrolmentDashboardView(source, state.enrolment.individual.uuid, state.enrolment.uuid, true);
                };
                const headerMessage = `${this.I18n.t(state.enrolment.program.displayName)}, ${this.I18n.t(ProgramEnrolmentState.UsageKeys.Enrol ? 'enrol' : 'exit')} - ${this.I18n.t('summaryAndRecommendations')}`;
                const formMappingService = this.context.getService(FormMappingService);
                const form = formMappingService.findFormForProgramEnrolment(state.enrolment.program);
                CHSNavigator.navigateToSystemsRecommendationView(this, decisions, ruleValidationErrors, state.enrolment.individual, observations, Actions.SAVE, onSaveCallback, headerMessage, checklists, nextScheduledVisits, form);
            },
            movedNext: this.scrollToTop
        });
    }

    render() {
        const enrol = this.props.context.usage === ProgramEnrolmentState.UsageKeys.Enrol;
        const validationKey = enrol
            ? ProgramEnrolment.validationKeys.ENROLMENT_LOCATION
            : ProgramEnrolment.validationKeys.EXIT_LOCATION

        return (<CHSContainer theme={themes}>
            <CHSContent ref="scroll">
                <AppHeader
                    title={this.I18n.t('enrolInSpecificProgram', {program: this.props.state.enrolment.program.displayName})}
                    func={this.props.backFunction}/>
                {this.props.state.wizard.isFirstFormPage() ?
                    <View>
                        <IndividualProfile viewContext={IndividualProfile.viewContext.Wizard}
                                           individual={this.props.state.enrolment.individual}/>
                        <GeolocationFormElement
                            location={enrol ? this.props.state.enrolment.enrolmentLocation : this.props.state.enrolment.exitLocation}
                            editing={this.props.editing}
                            actionName={enrol ? Actions.SET_ENROLMENT_LOCATION : Actions.SET_EXIT_LOCATION}
                            errorActionName={Actions.SET_LOCATION_ERROR}
                            validationResult={AbstractDataEntryState.getValidationError(this.props.state, validationKey)}
                            style={{marginHorizontal: Distances.ContentDistanceFromEdge}}
                        />
                        <DateFormElement actionName={this.props.context.dateAction}
                                         element={new StaticFormElement(this.props.context.dateKey)}
                                         dateValue={new PrimitiveValue(this.props.state.enrolment[this.props.context.dateField])}
                                         validationResult={AbstractDataEntryState.getValidationError(this.props.state, this.props.context.dateValidationKey)}
                                         style={{marginHorizontal: Distances.ContentDistanceFromEdge}}/>
                    </View>
                    :
                    <View/>}
                <View style={{paddingHorizontal: Distances.ScaledContentDistanceFromEdge, flexDirection: 'column'}}>
                    <FormElementGroup actions={Actions} group={this.props.state.formElementGroup}
                                      observationHolder={this.props.state.applicableObservationsHolder}
                                      validationResults={this.props.state.validationResults}
                                      formElementsUserState={this.props.state.formElementsUserState}
                                      filteredFormElements={this.props.state.filteredFormElements}
                                      dataEntryDate={this.props.state.enrolment.enrolmentDateTime}/>
                    <WizardButtons previous={{
                        visible: !this.props.state.wizard.isFirstPage(),
                        func: () => this.props.previous(),
                        label: this.I18n.t('previous')
                    }}
                                   next={{func: () => this.next(), label: this.I18n.t('next')}}/>
                </View>
            </CHSContent>
        </CHSContainer>);
    }
}

export default ProgramFormComponent;