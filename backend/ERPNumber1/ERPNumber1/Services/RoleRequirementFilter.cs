using ERPNumber1.Interfaces;
using ERPNumber1.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Reflection;
using System.Security.Claims;

namespace ERPNumber1.Services
{
    public class RoleRequirementFilter : IActionFilter
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public RoleRequirementFilter(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var descriptor = context.ActionDescriptor as ControllerActionDescriptor;

            var roleAttr = descriptor?.MethodInfo.GetCustomAttribute<RequireRoleAttribute>();
            Role[] requiredRoles = null;

            if (roleAttr != null)
            {
                requiredRoles = roleAttr.AllowedRoles;
            }
            else if (context.Controller is IRequireRole controllerWithRoles)
            {
                requiredRoles = controllerWithRoles.AllowedRoles;
            }

            if (requiredRoles == null || requiredRoles.Length == 0)
                return;

            var roleClaim = context.HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;

            if (roleClaim == null || !Enum.TryParse<Role>(roleClaim, out var userRole))
            {
                context.Result = new ForbidResult();
                return;
            }

            if (!requiredRoles.Contains(userRole))
            {
                context.Result = new ForbidResult();
            }
        }
        public void OnActionExecuted(ActionExecutedContext context) { }

    }
}

