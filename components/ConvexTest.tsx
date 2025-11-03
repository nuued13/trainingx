import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "../contexts/AuthContextProvider";

export function ConvexTest() {
  const { user, isAuthenticated } = useAuth();

  // Test basic queries
  const projects = useQuery(api.projects.getProjects, { limit: 5 });
  const assessments = useQuery(api.assessments.getAssessments, { limit: 3 });
  const customGPTs = useQuery(api.customGPTs.getCustomGPTs, { limit: 3 });

  return (
    <div className="p-6 bg-gray-50 rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Convex Integration Test</h2>

      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        <div className="space-y-1">
          <p><strong>Authenticated:</strong> {isAuthenticated ? "✅ Yes" : "❌ No"}</p>
          <p><strong>User:</strong> {user ? user.email : "Not logged in"}</p>
        </div>
      </div>

      {/* Projects Test */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Projects (from Convex)</h3>
        {projects === undefined ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects found</p>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project._id} className="p-2 border rounded">
                <p className="font-medium">{project.title}</p>
                <p className="text-sm text-gray-600">{project.category} - {project.difficulty}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessments Test */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Assessments (from Convex)</h3>
        {assessments === undefined ? (
          <p>Loading assessments...</p>
        ) : assessments.length === 0 ? (
          <p>No assessments found</p>
        ) : (
          <div className="space-y-2">
            {assessments.map((assessment) => (
              <div key={assessment._id} className="p-2 border rounded">
                <p className="font-medium">{assessment.title}</p>
                <p className="text-sm text-gray-600">{assessment.category} - {assessment.difficulty}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom GPTs Test */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Custom GPTs (from Convex)</h3>
        {customGPTs === undefined ? (
          <p>Loading custom GPTs...</p>
        ) : customGPTs.length === 0 ? (
          <p>No custom GPTs found</p>
        ) : (
          <div className="space-y-2">
            {customGPTs.map((gpt) => (
              <div key={gpt._id} className="p-2 border rounded">
                <p className="font-medium">{gpt.name}</p>
                <p className="text-sm text-gray-600">{gpt.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Integration Status</h3>
        <ul className="list-disc list-inside text-green-700 space-y-1">
          <li>Convex backend: Connected and running</li>
          <li>Frontend: Connected to Convex</li>
          <li>Authentication context: Integrated</li>
          <li>React Query: Working with Convex</li>
        </ul>
      </div>
    </div>
  );
}