using System.Collections.Generic;
using System.Linq;
using MFilesAPI;

namespace MFToolbox.Core
{
	/// <summary>
	/// Static resolution class.
	/// </summary>
	public static class Resolve
	{
		/// <summary>
		/// Resolves a property by its id.
		/// </summary>
		/// <param name="v"><see cref="Vault"/></param>
		/// <param name="id">Property ID</param>
		/// <returns><see cref="PropertyDefAdmin"/></returns>
		public static PropertyDefAdmin PropertyDefById(this Vault v, int id) => v.PropertyDefOperations.GetPropertyDefAdmin(id);

		/// <summary>
		/// Resolves a workflow by id.
		/// </summary>
		/// <param name="v"><see cref="Vault"/></param>
		/// <param name="id">Workflow ID</param>
		/// <returns><see cref="WorkflowAdmin"/></returns>
		public static WorkflowAdmin WorkflowById(this Vault v, int id)
		{
			// Get all workflows.
			List<WorkflowAdmin> workflows = v.WorkflowOperations.GetWorkflowsAdmin().Cast<WorkflowAdmin>().ToList();

			// Filter to the workflow containing the state with the provided id.
			return workflows.Single(wf => wf.Workflow.ID == id);
		}

		/// <summary>
		/// Resolves a state by state.id
		/// </summary>
		/// <param name="v"><see cref="Vault"/></param>
		/// <param name="id">State ID</param>
		/// <param name="wfAdmin">Resolved <see cref="StateAdmin"/>'s owner <see cref="WorkflowAdmin"/></param>
		/// <returns><see cref="StateAdmin"/>State with the passed id.</returns>
		public static StateAdmin StateById(this Vault v, int id, out WorkflowAdmin wfAdmin)
		{
			// Get all workflows.
			List<WorkflowAdmin> workflows = v.WorkflowOperations.GetWorkflowsAdmin().Cast<WorkflowAdmin>().ToList();

			// Filter to the workflow containing the state with the provided id.
			wfAdmin = workflows.Single(wf => wf.States.Cast<State>().Any(s => s.ID == id));

			// Ensure a result was found / extract the state from the workflow's states collection.
			return wfAdmin?.States.Cast<StateAdmin>().FirstOrDefault(s => s.ID == id);
		}

		/// <summary>
		/// Resolves a state transition by state.transition.id
		/// </summary>
		/// <param name="v"><see cref="Vault"/></param>
		/// <param name="id">State Transition ID</param>
		/// <param name="wfAdmin">Resolved <see cref="StateTransition"/>'s owner <see cref="WorkflowAdmin"/></param>
		/// <returns><see cref="StateAdmin"/>State with the passed id.</returns>
		public static StateTransition StateTransitionById(this Vault v, int id, out WorkflowAdmin wfAdmin)
		{
			// Get all workflows.
			List<WorkflowAdmin> workflows = v.WorkflowOperations.GetWorkflowsAdmin().Cast<WorkflowAdmin>().ToList();

			// Filter to the workflow containing the state with the provided id.
			wfAdmin = workflows.Single(wf => wf.StateTransitions.Cast<StateTransition>().Any(s => s.ID == id));

			// Ensure a result was found / extract the state from the workflow's states collection.
			return wfAdmin?.StateTransitions.Cast<StateTransition>().FirstOrDefault(st => st.ID == id);
		}

		/// <summary>
		/// Resolves an <see cref="ObjectClassAdmin"/> by ID.
		/// </summary>
		/// <param name="v"><see cref="Vault"/></param>
		/// <param name="id">Class ID</param>
		/// <returns><see cref="ObjectClassAdmin"/></returns>
		public static ObjectClassAdmin ClassById(this Vault v, int id) => v.ClassOperations.GetAllObjectClassesAdmin().Cast<ObjectClassAdmin>().FirstOrDefault(oc => oc.ID == id);

		/// <summary>
		/// Resolves an <see cref="ObjTypeAdmin"/> by ID.
		/// </summary>
		/// <param name="v"><see cref="Vault"/></param>
		/// <param name="id">ObjType ID</param>
		/// <returns><see cref="ObjTypeAdmin"/></returns>
		public static ObjTypeAdmin ObjTypeById(this Vault v, int id) => v.ObjectTypeOperations.GetObjectTypesAdmin().Cast<ObjTypeAdmin>().FirstOrDefault(x => x.ObjectType.ID == id);
	}
}
